import { IEntry } from '../types'

export const getParentPath = (path: string) =>
  path.split('/').slice(0, -1).join('/')

export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
