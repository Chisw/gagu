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
  type: EntryType.directory
  isDisk: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface ISideEntry extends IRootEntry {
  isFavorited?: boolean
}

export interface IDisk extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}

export interface IBaseData {
  version: string
  serverOS: IServerOS
  deviceName: string
  desktopEntryList: IEntry[]
  rootEntryList: IRootEntry[]
  favoriteEntryList: ISideEntry[]
}

export enum Sort {
  default = 'default',
  extension = 'extension',
  extensionDesc = 'extensionDesc',
  name = 'name',
  nameDesc = 'nameDesc',
  lastModified = 'lastModified',
  lastModifiedDesc = 'lastModifiedDesc',
  size = 'size',
  sizeDesc = 'sizeDesc',
}

export type SortType = keyof typeof Sort
