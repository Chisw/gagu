import { IDownloadTunnel, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { DownloadTunnelForm } from '../../types'
import {
  genHashCode,
  readDownloadTunnelData,
  writeDownloadTunnelData,
} from '../../utils'
import { UserService } from '../user/user.service'

@Injectable()
export class DownloadService {
  private downloadTunnelList: IDownloadTunnel[] = []

  constructor(private readonly userService: UserService) {
    console.log('  - init Download')
    this.downloadTunnelList = readDownloadTunnelData()
  }

  sync() {
    writeDownloadTunnelData(this.downloadTunnelList)
  }

  findOne(code: string) {
    return this.downloadTunnelList.find((tunnel) => tunnel.code === code)
  }

  minusTimes(code: string) {
    const tunnel = this.findOne(code)
    if (tunnel && tunnel.leftTimes) {
      tunnel.leftTimes--
      this.sync()
    }
  }

  create(username: User.Username, tunnelForm: DownloadTunnelForm) {
    const code = genHashCode()
    const nickname = this.userService.findOne(username)?.nickname || 'UNKNOWN'
    const tunnel: IDownloadTunnel = {
      code,
      username,
      nickname,
      createdAt: Date.now(),
      ...tunnelForm,
    }
    this.downloadTunnelList.push(tunnel)
    this.sync()
    return code
  }

  remove(code: string) {
    this.downloadTunnelList = this.downloadTunnelList.filter(
      (t) => t.code !== code,
    )
    this.sync()
  }

  findUserTunnels(username: User.Username) {
    return this.downloadTunnelList.filter((t) => t.username === username)
  }
}
