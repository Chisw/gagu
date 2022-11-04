import { Public } from 'src/common/decorators/public.decorator'
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
} from 'src/types'
import { Permission } from 'src/common/decorators/permission.decorator'
import 'express-zip'
import { AuthService } from '../auth/auth.service'
import { HEADERS_AUTH_KEY, SERVER_MESSAGE_MAP, getEntryPath } from 'src/utils'

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
      const id = this.downloadService.create(username, tunnelBase)
      console.log({ downloadTunnelId: id })
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        id,
      }
    }
  }

  @Public()
  @Get(':id')
  @Permission(UserPermission.read)
  downloads(@Param('id') id: string, @Res() response: ZipResponse) {
    const tunnel = this.downloadService.findOne(id)
    if (tunnel) {
      const { entryList, basePath, downloadName, expiredAt, leftTimes } = tunnel
      const isExpired = expiredAt && expiredAt < Date.now()
      const isNoLeft = leftTimes === 0
      // TODO: handle share
      console.log({ isExpired, isNoLeft })
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
