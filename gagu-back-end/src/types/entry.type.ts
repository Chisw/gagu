// Sync following code to BE & FE
import { IServerOS } from './common.type'

export enum EntryType {
  directory = 'directory',
  file = 'file',
}

export interface IEntry {
  name: string
  type: keyof typeof EntryType
  hidden: boolean
  lastModified: number
  parentPath: string
  hasChildren: boolean
  extension: string
  size?: number
}

export interface IRootEntry extends IEntry {
  isDisk: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface IDisk extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}

export interface IRootInfo {
  version: string
  serverOS: IServerOS
  deviceName: string
  desktopEntryList: IEntry[]
  rootEntryList: IRootEntry[]
  favoritePathList: string[]
  thumbnailSupported: boolean
}
