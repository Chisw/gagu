import { IDownloadTunnel, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { DownloadTunnelBase } from 'src/types'
import {
  genHashId,
  readDownloadTunnelData,
  writeDownloadTunnelData,
} from 'src/utils'

@Injectable()
export class DownloadService {
  private downloadTunnelList: IDownloadTunnel[] = []

  constructor() {
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
}
