export interface IEntry {
  name: string
  type: 'directory' | 'file'
  size: number
  hidden: boolean
  lastModified: number
  hasChildren: boolean
}

export interface IMount extends IEntry {
  mount: string
  isVolume: boolean
}

export interface IVolume extends IMount {
  spaceFree: number
  spaceTotal: number
}
