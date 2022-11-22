import { FsService } from './../fs/fs.service'
import { Public } from '../../common/decorators/public.decorator'
import { DownloadService } from './download.service'
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
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
import {
  HEADERS_AUTH_KEY,
  SERVER_MESSAGE_MAP,
  getEntryPath,
  checkTunnel,
} from '../../utils'

@Controller('download')
export class DownloadController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly authService: AuthService,
    private readonly fsService: FsService,
  ) {}

  @Post()
  @Permission(UserPermission.read)
  create(
    @Headers(HEADERS_AUTH_KEY) token: User.Token,
    @Body() tunnelForm: DownloadTunnelForm,
  ) {
    const username = this.authService.findOneUsername(token)
    if (username) {
      const code = this.downloadService.create(username, tunnelForm)
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
  download(
    @Param('code') code: string,
    @Query('password') inputtedPassword: string,
    @Res() response: ZipResponse,
  ) {
    const tunnel = this.downloadService.findOne(code)
    const checkRes = checkTunnel(tunnel, inputtedPassword)

    if (checkRes.success && tunnel) {
      const { entryList, downloadName } = tunnel
      const firstEntry = entryList[0]
      const isSingleFile =
        entryList.length === 1 && firstEntry.type === EntryType.file
      this.downloadService.minusTimes(code)
      if (isSingleFile) {
        return response.download(getEntryPath(firstEntry))
      }
      const rootParentPath = firstEntry.parentPath
      const list = this.fsService.getFlattenRecursiveEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(rootParentPath, '')
        return { name, path }
      })
      response.zip(files, downloadName)
    } else {
      return checkRes
    }
  }

  @Public()
  @Get(':code/share')
  findOne(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { entryList, password } = tunnel
      if (password) {
        if (!inputtedPassword) {
          return {
            success: true,
            message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_NEEDED,
            tunnel: {
              ...tunnel,
              password: undefined,
              entryList: [],
            },
            flattenList: [],
          }
        } else if (inputtedPassword !== password) {
          return {
            success: false,
            message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_WRONG,
          }
        }
      }
      const flattenList = this.fsService.getFlattenRecursiveEntryList(entryList)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        tunnel: {
          ...tunnel,
          password: undefined,
        },
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
  @Get(':code/check')
  check(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.downloadService.findOne(code)
    const checkRes = checkTunnel(tunnel, inputtedPassword)
    return checkRes
  }
}
