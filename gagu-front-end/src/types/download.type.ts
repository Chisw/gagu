// Sync following code to BE & FE
import { IEntry } from './entry.type'
import { User } from './user.type'

export enum DownloadTunnelType {
  download = 'download',
  share = 'share',
}

export type DownloadTunnelTypeType = keyof typeof DownloadTunnelType

export interface DownloadTunnelForm {
  type: DownloadTunnelTypeType
  entryList: IEntry[]
  downloadName: string
  leftTimes?: number
  expiredAt?: number
  password?: string
}

export interface IDownloadTunnel extends DownloadTunnelForm {
  code: string
  username: User.Username
  nickname: User.Nickname
  createdAt: number
  hasPassword: boolean
}
