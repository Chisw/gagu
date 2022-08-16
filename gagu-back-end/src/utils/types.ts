export enum EntryType {
  directory = 'directory',
  file = 'file',
}

export interface IEntry {
  name: string
  type: EntryType.directory | EntryType.file
  hidden: boolean
  lastModified: number
  parentPath: string
  hasChildren: boolean
  extension: string
  size?: number
  mounted?: string
  isVolume?: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface IRootEntry extends IEntry {
  mounted: string
  isVolume: boolean
}

export interface IVolume extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}
