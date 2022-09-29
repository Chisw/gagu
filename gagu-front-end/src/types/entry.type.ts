import { IApp } from './app.type'

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
  label: string
  isDisk: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface IDisk extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}

export interface IRootInfo {
  version: string,
  platform: string,
  deviceName: string
  desktopEntryList: IEntry[]
  rootEntryList: IRootEntry[]
}

export interface IOpenOperation {
  app: IApp
  matchedEntryList: IEntry[]
  activeEntryIndex: number
}
