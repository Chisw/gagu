import { DateTime } from 'luxon'
import { FsApi } from '../api'
import { CALLABLE_APP_LIST } from '../apps'
import { EntryType, IEntry, INestedFile } from '../types'
import { getReadableSize } from './common.util'

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
  const parentPathName = parentPath.split('/').reverse()[0]
  const count = selectedEntryList.length
  const firstEntry: IEntry | undefined = selectedEntryList[0]
  const isDownloadAll = !count
  const isDownloadSingle = count === 1
  const isDownloadSingleDir = isDownloadSingle && firstEntry.type === EntryType.directory
  const singleEntryName = firstEntry?.name

  const downloadName = isDownloadAll
    ? `${parentPathName}.zip`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `${singleEntryName}.zip`
        : singleEntryName
      : `${parentPathName}.zip`

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
        // TODO:
        if (fileName !== '.DS_Store' && !fileName.startsWith('._')) {
          nestedFileList.push(Object.assign(file, { fullPath: entry.fullPath }))
        }
        resolve(true)
      })
    })
  } else {
    await new Promise(async (resolve, reject) => {
      const directoryReader = (entry as FileSystemDirectoryEntry).createReader()
      const readFiles = async () => {
        directoryReader.readEntries(async (entryList: FileSystemEntry[]) => {
          if (entryList.length) {
            for (const entry of entryList) {
              const list = await getEntryNestedFileList(entry)
              nestedFileList.push(...list)
            }
            await readFiles()
          } else {
            resolve(true)
          }
        })
      }
      await readFiles()
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

export const getEntryLabels = (entry: IEntry) => {
  const { size, lastModified } = entry
  const sizeLabel = size === undefined ? '--' : getReadableSize(size)
  const dateLabel = lastModified ? DateTime.fromMillis(lastModified).toFormat('yyyy-MM-dd HH:mm') : ''
  return { sizeLabel, dateLabel }
}

// Sync following code to BE & FE
export const getEntryPath = (entry: IEntry | null | undefined) => {
  if (!entry) return ''
  const { name, parentPath } = entry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}

export const safeQuotes = (path: string) =>
  path.replace(/"/g, '\\"').replace(/`/g, '\\`')
