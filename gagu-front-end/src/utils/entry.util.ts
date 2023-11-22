import { FsApi } from '../api'
import { CALLABLE_APP_LIST } from '../apps'
import { EntryType, IEntry, INestedFile, IRootEntry } from '../types'

export const isSameEntry = (a: IEntry, b: IEntry) => {
  return a.name === b.name && a.parentPath === b.parentPath
}

export const openInIINA = (entry: IEntry) => {
  if (!entry) return
  const a = document.createElement('a')
  a.href = `iina://open?url=${encodeURIComponent(FsApi.getEntryStreamUrl(entry))}`
  a.click()
}

export const getMatchedApp = (entry: IEntry) => {
  const { extension } = entry
  if (!extension) return
  return CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))
}

export const getDownloadInfo = (parentPath: string, selectedEntryList: IEntry[], t: (key: string | TemplateStringsArray, params?: any) => string) => {
  const pathName = parentPath.split('/').reverse()[0]
  const count = selectedEntryList.length
  const firstEntry: IEntry | undefined = selectedEntryList[0]
  const isDownloadAll = !count
  const isDownloadSingle = count === 1
  const isDownloadSingleDir = isDownloadSingle && firstEntry.type === EntryType.directory
  const singleEntryName = firstEntry?.name

  const downloadName = isDownloadAll
    ? `${pathName}.zip`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `${singleEntryName}.zip`
        : singleEntryName
      : `${pathName}.zip`

  const message = isDownloadAll
    ? t('tip.downloadAllAs', { name: downloadName })
    : isDownloadSingle
      ? isDownloadSingleDir
        ? t('tip.downloadFolderAs', { folderName: singleEntryName, name: downloadName })
        : t('tip.downloadFile', { name: downloadName })
      : t('tip.downloadItemsAs', { count, name: downloadName })
  
  return { downloadName, message }
}

export const getEntryNestedFileList = async (entry: FileSystemEntry) => {
  const nestedFileList: INestedFile[] = []
  if (entry.isFile) {
    await new Promise((resolve, reject) => {
      (entry as FileSystemFileEntry).file((file: File) => {
        const fileName = file.name
        if (fileName !== '.DS_Store' && !fileName.startsWith('._')) {
          nestedFileList.push(Object.assign(file, { fullPath: entry.fullPath }))
        }
        resolve(true)
      })
    })
  } else {
    await new Promise((resolve, reject) => {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      reader.readEntries(async (entryList: FileSystemEntry[]) => {
        for (const entry of entryList) {
          const list = await getEntryNestedFileList(entry)
          nestedFileList.push(...list)
        }
        resolve(true)
      })
    })
  }
  return nestedFileList
}

export const getDataTransferNestedFileList = async (dataTransfer: DataTransfer) => {
  const nestedFileList: INestedFile[] = []
  const { items } = dataTransfer
  // don't use `for of`
  await Promise.all(Array.from(items).map(async (item) => {
    if (item.kind === 'file' && item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry()
      if (entry) {
        const files = await getEntryNestedFileList(entry)
        nestedFileList.push(...files)
      }
    } else if (item.kind === 'string') {
      // TODO: handle string
    }
  }))
  return nestedFileList
}

export const path2RootEntry = (path: string) => {
  const names = path.split('/')
  const lastName = names.pop()

  const entry: IRootEntry = {
    name: lastName!,
    type: EntryType.directory,
    hidden: false,
    lastModified: 0,
    parentPath: names.join('/'),
    hasChildren: false,
    extension: '_dir',
    isDisk: false,
  }

  return entry
}

// Sync following code to BE & FE
export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
