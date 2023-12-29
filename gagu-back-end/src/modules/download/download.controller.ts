import { FsService } from './../fs/fs.service'
import { Public } from '../../common/decorators'
import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { EntryType, ZipResponse, ZipResponseFile } from '../../types'
import { getEntryPath, checkTunnel } from '../../utils'
import { TunnelService } from '../tunnel/tunnel.service'
import 'express-zip'

@Controller('download')
export class DownloadController {
  constructor(
    private readonly tunnelService: TunnelService,
    private readonly fsService: FsService,
  ) {}

  @Public()
  @Get(':code')
  download(
    @Param('code') code: string,
    @Query('password') inputtedPassword: string,
    @Res() response: ZipResponse,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    const result = checkTunnel(tunnel, inputtedPassword)

    if (result.success && tunnel) {
      const { entryList, downloadName } = tunnel
      const firstEntry = entryList[0]
      const isSingleFile =
        entryList.length === 1 && firstEntry.type === EntryType.file

      this.tunnelService.minusTimes(code)

      if (isSingleFile) {
        return response.download(getEntryPath(firstEntry))
      }

      const rootParentPath = firstEntry.parentPath
      const list = this.fsService.getRecursiveFlattenEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(rootParentPath, '')
        return { name, path }
      })

      response.zip(files, encodeURIComponent(downloadName))
    } else {
      response.end(JSON.stringify(result))
    }
  }
}
