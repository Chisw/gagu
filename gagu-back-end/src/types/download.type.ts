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

export interface DownloadTunnelBase {
  entryList: IEntry[]
  basePath: string
  downloadName: string
  leftTimes: number
  expiredAt?: number
  password?: string
}

export interface IDownloadTunnel extends DownloadTunnelBase {
  code: string
  creator: User.Username
  createdAt: number
}
