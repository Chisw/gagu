import { IServerOS } from './common.type'

export const EntryType = {
  directory: 'directory',
  file: 'file',
} as const

export type EntryTypeType = keyof typeof EntryType

export interface IEntry {
  name: string
  type: EntryTypeType
  hidden: boolean
  lastModified: number
  parentPath: string
  hasChildren: boolean
  extension: string
  size?: number
}

export const RootEntryGroup = {
  server: 'server',
  user: 'user',
  favorite: 'favorite',
} as const

export type RootEntryGroupType = keyof typeof RootEntryGroup

export interface IRootEntry extends IEntry {
  type: typeof EntryType.directory
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

export const Sort = {
  default: 'default',
  extension: 'extension',
  extensionDesc: 'extensionDesc',
  name: 'name',
  nameDesc: 'nameDesc',
  lastModified: 'lastModified',
  lastModifiedDesc: 'lastModifiedDesc',
  size: 'size',
  sizeDesc: 'sizeDesc',
} as const

export type SortType = keyof typeof Sort
