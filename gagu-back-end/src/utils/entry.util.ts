import {
  EntryType,
  IEntry,
  IRootEntry,
  RootEntryGroupType,
} from '../types/entry.type'

export const path2RootEntry = (path: string, group: RootEntryGroupType) => {
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
    group,
    isDisk: false,
  }
  return entry
}

// Sync following code to BE & FE
export const getParentPath = (path: string) =>
  path.split('/').slice(0, -1).join('/')

export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
