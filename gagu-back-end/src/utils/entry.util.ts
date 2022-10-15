import { IEntry } from '../types/entry.type'

// Sync following code to BE & FE
export const getEntryPath = (rootEntry: IEntry | null) => {
  if (!rootEntry) return ''
  const { name, parentPath } = rootEntry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
