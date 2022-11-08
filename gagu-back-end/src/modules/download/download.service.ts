import { EntryType, IDownloadTunnel, IEntry, User } from '../../types'
import { Injectable } from '@nestjs/common'
import { DownloadTunnelForm } from '../../types'
import {
  genHashCode,
  getEntryPath,
  readDownloadTunnelData,
  writeDownloadTunnelData,
} from '../../utils'
import { FsService } from '../fs/fs.service'
import { UserService } from '../user/user.service'

@Injectable()
export class DownloadService {
  private downloadTunnelList: IDownloadTunnel[] = []

  constructor(
    private readonly fsService: FsService,
    private readonly userService: UserService,
  ) {
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

  create(username: User.Username, tunnelBase: DownloadTunnelForm) {
    const code = genHashCode()
    const nickname = this.userService.findOne(username)?.nickname || 'UNKNOWN'
    const tunnel: IDownloadTunnel = {
      code,
      username,
      nickname,
      createdAt: Date.now(),
      ...tunnelBase,
      password: undefined,
      hasPassword: !!tunnelBase.password,
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
