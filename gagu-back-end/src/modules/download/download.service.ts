import { EntryType, IDownloadTunnel, IEntry, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { DownloadTunnelBase } from 'src/types'
import {
  genHashId,
  getEntryPath,
  readDownloadTunnelData,
  writeDownloadTunnelData,
} from 'src/utils'
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

  findOne(id: string) {
    return this.downloadTunnelList.find((tunnel) => tunnel.id === id)
  }

  create(creator: User.Username, tunnelBase: DownloadTunnelBase) {
    const id = genHashId()
    const tunnel: IDownloadTunnel = {
      id,
      creator,
      createdAt: Date.now(),
      ...tunnelBase,
    }
    this.downloadTunnelList.push(tunnel)
    this.sync()
    return id
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
