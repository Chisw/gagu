import { EntryType, IDownloadTunnel, IEntry, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { DownloadTunnelBase } from '../../types'
import {
  genHashCode,
  getEntryPath,
  readDownloadTunnelData,
  writeDownloadTunnelData,
} from '../../utils'
import { FsService } from '../fs/fs.service'

@Injectable()
export class DownloadService {
  private downloadTunnelList: IDownloadTunnel[] = []

  constructor(private readonly fsService: FsService) {
    this.downloadTunnelList = readDownloadTunnelData()
  }

  sync() {
    writeDownloadTunnelData(this.downloadTunnelList)
  }

  findOne(code: string) {
    return this.downloadTunnelList.find((tunnel) => tunnel.code === code)
  }

  create(creator: User.Username, tunnelBase: DownloadTunnelBase) {
    const code = genHashCode()
    const tunnel: IDownloadTunnel = {
      code,
      creator,
      createdAt: Date.now(),
      ...tunnelBase,
    }
    this.downloadTunnelList.push(tunnel)
    this.sync()
    return code
  }

  getFlattenRecursiveEntryList(entryList: IEntry[]) {
    const list: IEntry[] = []
    entryList.forEach((entry) => {
      if (entry.type === EntryType.file) {
        list.push(entry)
      } else {
        const subEntryList = this.fsService.getEntryList(getEntryPath(entry))
        const subList = this.getFlattenRecursiveEntryList(subEntryList)
        list.push(...subList)
      }
    })
    return list
  }
}
