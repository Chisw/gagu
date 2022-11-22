import { Response } from 'express'

export interface ZipResponseFile {
  name: string
  path: string
}

export interface ZipResponse extends Response {
  zip: (files: ZipResponseFile[], name?: string, cb?: () => void) => void
}

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
}
