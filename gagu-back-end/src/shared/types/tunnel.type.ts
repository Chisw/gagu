import { IEntry } from './entry.type'
import { User } from './user.type'

export const TunnelType = {
  download: 'download',
  share: 'share',
} as const

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
