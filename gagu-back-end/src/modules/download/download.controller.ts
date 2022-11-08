import { Public } from '../../common/decorators/public.decorator'
import { DownloadService } from './download.service'
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import {
  UserPermission,
  DownloadTunnelForm,
  User,
  EntryType,
  ZipResponse,
  ZipResponseFile,
} from '../../types'
import { Permission } from '../../common/decorators/permission.decorator'
import 'express-zip'
import { AuthService } from '../auth/auth.service'
import { HEADERS_AUTH_KEY, SERVER_MESSAGE_MAP, getEntryPath } from '../../utils'

@Controller('download')
export class DownloadController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Permission(UserPermission.read)
  create(
    @Headers(HEADERS_AUTH_KEY) token: User.Token,
    @Body() tunnelBase: DownloadTunnelForm,
  ) {
    const username = this.authService.findOneUsername(token)
    if (username) {
      const code = this.downloadService.create(username, tunnelBase)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        code,
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_USER_NOT_EXISTED,
      }
    }
  }

  @Public()
  @Get(':code')
  download(@Param('code') code: string, @Res() response: ZipResponse) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { entryList, rootParentPath, downloadName, expiredAt, leftTimes } =
        tunnel
      const isNoLeft = leftTimes === 0
      const isExpired = !!(expiredAt && expiredAt < Date.now())
      // TODO: handle share
      console.log({ code, isExpired, isNoLeft })

      this.downloadService.minusTimes(code)
      if (entryList.length === 1 && entryList[0].type === EntryType.file) {
        return response.download(getEntryPath(entryList[0]))
      }
      const list = this.downloadService.getFlattenRecursiveEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(rootParentPath, '')
        return { name, path }
      })
      response.zip(files, downloadName)
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NOT_EXISTED,
      }
    }
  }

  @Public()
  @Get('/:code/share')
  findOne(@Param('code') code: string) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { entryList } = tunnel
      const flattenList =
        this.downloadService.getFlattenRecursiveEntryList(entryList)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        tunnel,
        flattenList,
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NOT_EXISTED,
      }
    }
  }

  @Public()
  @Get('/:code/call/:password')
  call(@Param('code') code: string, @Param('password') callPassword?: string) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { leftTimes, expiredAt, password } = tunnel

      if (leftTimes === 0) {
        return {
          success: false,
          message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NO_LEFT,
        }
      } else if (expiredAt && expiredAt < Date.now()) {
        return {
          success: false,
          message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_EXPIRED,
        }
      } else if (password && callPassword !== password) {
        return {
          success: false,
          message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_WRONG,
        }
      } else {
        return {
          success: true,
          message: SERVER_MESSAGE_MAP.OK,
        }
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NOT_EXISTED,
      }
    }
  }
}
