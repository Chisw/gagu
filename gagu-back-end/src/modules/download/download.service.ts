import { ITunnel, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { TunnelForm } from '../../types'
import {
  genHashCode,
  readTunnelData,
  writeTunnelData,
} from '../../utils'
import { UserService } from '../user/user.service'

@Injectable()
export class DownloadService {
  private tunnelList: ITunnel[] = []

  constructor(private readonly userService: UserService) {
    console.log('  - init Download')
    this.tunnelList = readTunnelData()
  }

  sync() {
    writeTunnelData(this.tunnelList)
  }

  findOne(code: string) {
    return this.tunnelList.find((tunnel) => tunnel.code === code)
  }

  minusTimes(code: string) {
    const tunnel = this.findOne(code)
    if (tunnel && tunnel.leftTimes) {
      tunnel.leftTimes--
      this.sync()
    }
  }

  create(username: User.Username, tunnelForm: TunnelForm) {
    const code = genHashCode()
    const nickname = this.userService.findOne(username)?.nickname || 'UNKNOWN'
    const tunnel: ITunnel = {
      code,
      username,
      nickname,
      createdAt: Date.now(),
      ...tunnelForm,
    }
    this.tunnelList.push(tunnel)
    this.sync()
    return code
  }

  remove(code: string) {
    this.tunnelList = this.tunnelList.filter(
      (t) => t.code !== code,
    )
    this.sync()
  }

  findUserTunnels(username: User.Username) {
    return this.tunnelList.filter((t) => t.username === username)
  }
}
