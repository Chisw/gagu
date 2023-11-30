import { EntryType, IEntry, IRootEntry, ISideEntry } from '../types/entry.type'

export const rootPath2RootEntry = (path: string) => {
  const names = path.split('/')
  const lastName = names.pop()

  const entry: IRootEntry = {
    name: lastName || '',
    type: EntryType.directory,
    hidden: false,
    lastModified: 0,
    parentPath: names.join('/'),
    hasChildren: true,
    extension: '_dir',
    isDisk: false,
  }
  return entry
}

export const favoritePath2SideEntry = (path: string) => {
  const names = path.split('/')
  const lastName = names.pop()

  const entry: ISideEntry = {
    name: lastName || '',
    type: EntryType.directory,
    hidden: false,
    lastModified: 0,
    parentPath: names.join('/'),
    hasChildren: true,
    extension: '_dir',
    isDisk: false,
    isFavorited: true,
  }
  return entry
}

// Sync following code to BE & FE
export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}

export const safeQuotes = (path: string) =>
  path.replace(/"/g, '\\"').replace(/`/g, '\\`')
