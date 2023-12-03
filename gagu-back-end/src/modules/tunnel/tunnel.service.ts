import { ITunnel, TunnelType, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { TunnelForm } from '../../types'
import {
  generateRandomCode,
  readTunnelData,
  writeTunnelData,
} from '../../utils'

@Injectable()
export class TunnelService {
  private tunnelList: ITunnel[] = []

  constructor() {
    this.tunnelList = readTunnelData()
  }

  sync() {
    writeTunnelData(
      this.tunnelList.filter((t) => t.type !== TunnelType.download),
    )
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
    const code = generateRandomCode()
    const { type, leftTimes, expiredAt } = tunnelForm
    const isDownload = type === TunnelType.download
    const createdAt = Date.now()
    const tunnel: ITunnel = {
      code,
      username,
      nickname,
      createdAt,
      ...tunnelForm,
      leftTimes: isDownload ? 1 : leftTimes,
      expiredAt: isDownload ? createdAt + 60 * 1000 : expiredAt,
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
