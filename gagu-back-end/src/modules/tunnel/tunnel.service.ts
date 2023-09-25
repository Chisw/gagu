import { ITunnel, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { TunnelForm } from '../../types'
import { genRandomCode, readTunnelData, writeTunnelData } from '../../utils'

@Injectable()
export class TunnelService {
  private tunnelList: ITunnel[] = []

  constructor() {
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

  create(
    username: User.Username,
    nickname: User.Nickname,
    tunnelForm: TunnelForm,
  ) {
    const code = genRandomCode()
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
    this.tunnelList = this.tunnelList.filter((t) => t.code !== code)
    this.sync()
  }

  findUserTunnels(username: User.Username) {
    return this.tunnelList.filter(
      (t) => t.username === username && t.type === 'share',
    )
  }
}
