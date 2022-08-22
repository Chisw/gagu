export interface IUser {
  isAdmin: boolean
  username: string
  password: string
  avatar: string
  rootEntryList: string[]
  permissionList: string[]
  validUntil: number
}

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
