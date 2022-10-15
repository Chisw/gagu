// Sync following code to BE & FE
import { IEntry } from './entry.type'
import { User } from './user.type'

export interface DownloadTunnelBase {
  entryList: IEntry[]
  downloadName: string
  leftTimes: number
  expiredAt?: number
  code?: string
}

export interface IDownloadTunnel extends DownloadTunnelBase {
  id: string
  creator: User.Username
  createdAt: number
}
