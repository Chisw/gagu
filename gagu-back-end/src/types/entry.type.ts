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

export enum RootEntryGroup {
  system = 'system',
  user = 'user',
  favorite = 'favorite',
}

export type RootEntryGroupType = keyof typeof RootEntryGroup

export interface IRootEntry extends IEntry {
  type: EntryType.directory
  group: RootEntryGroupType
  isDisk: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface IDisk extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}

export interface IBaseData {
  version: string
  serverOS: IServerOS
  deviceName: string
  rootEntryList: IRootEntry[]
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
