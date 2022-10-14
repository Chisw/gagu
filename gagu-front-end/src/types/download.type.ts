// Sync following code to BE & FE
import { IEntry } from './entry.type'
import { User } from './user.type'

export interface IDownloadablePassage {
  id: string
  entryList: IEntry[]
  downloadName: string
  restTimes: number
  creator: User.Username
  createdAt: number
  expiredAt?: number
  code?: string
}
