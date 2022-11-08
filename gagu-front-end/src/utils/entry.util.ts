import { FsApi } from '../api'
import { CALLABLE_APP_LIST } from '../apps'
import { EntryType, IEntry, INestedFile } from '../types'

export const isSameEntry = (a: IEntry, b: IEntry) => {
  return a.name === b.name && a.type === b.type
}

export const openInIINA = (entry: IEntry) => {
  if (!entry) return
  const a = document.createElement('a')
  a.href = `iina://open?url=${encodeURIComponent(FsApi.getFileStreamUrl(entry))}`
  a.click()
}

export const entrySorter = (a: IEntry, b: IEntry) => {
  const map = { directory: 1, file: 2 }
  const aVal = map[a.type]
  const bVal = map[b.type]
  const typeDirection = aVal - bVal
  if (typeDirection !== 0) return typeDirection
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const getMatchedApp = (entry: IEntry) => {
  const { extension } = entry
  if (!extension) return
  return CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))
}

export const getDownloadInfo = (parentPath: string, selectedEntryList: IEntry[]) => {
  const pathName = parentPath.split('/').reverse()[0]
  const len = selectedEntryList.length
  const firstEntry: IEntry | undefined = selectedEntryList[0]
  const isDownloadAll = !len
  const isDownloadSingle = len === 1
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
    ? `下载当前整个目录为 ${downloadName}?`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `下载 ${singleEntryName} 为 ${singleEntryName}.zip?`
        : `下载 ${downloadName}?`
      : `下载 ${len} 个项目为 ${downloadName}?`
  
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


// Sync following code to BE & FE
export const getEntryPath = (rootEntry: IEntry | null) => {
  if (!rootEntry) return ''
  const { name, parentPath } = rootEntry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
