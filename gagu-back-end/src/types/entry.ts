export interface IEntry {
  name: string
  type: 'directory' | 'file'
  size: number | undefined
  hidden: boolean
  lastModified: number
  hasChildren: boolean
}
