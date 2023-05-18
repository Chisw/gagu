import { IEntry } from '../types/entry.type'

// Sync following code to BE & FE
export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
