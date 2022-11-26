// Sync following code to BE & FE
import { IEntry } from './entry.type'
import { User } from './user.type'

export enum TunnelType {
  download = 'download',
  share = 'share',
}

export type TunnelTypeType = keyof typeof TunnelType

export interface TunnelForm {
  type: TunnelTypeType
  entryList: IEntry[]
  downloadName: string
  leftTimes?: number
  expiredAt?: number
  password?: string
}

export interface ITunnel extends TunnelForm {
  code: string
  username: User.Username
  nickname: User.Nickname
  createdAt: number
}
