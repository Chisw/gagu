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
  DownloadTunnelBase,
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
    @Body() tunnelBase: DownloadTunnelBase,
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
  @Permission(UserPermission.read)
  downloads(@Param('code') code: string, @Res() response: ZipResponse) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { entryList, basePath, downloadName, expiredAt, leftTimes } = tunnel
      const isExpired = expiredAt && expiredAt < Date.now()
      const isNoLeft = leftTimes === 0
      // TODO: handle share
      console.log({ code, isExpired, isNoLeft })
      if (entryList.length === 1 && entryList[0].type === EntryType.file) {
        return response.download(getEntryPath(entryList[0]))
      }
      const list = this.downloadService.getFlattenRecursiveEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(basePath, '')
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
}
