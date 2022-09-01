import { FsApi } from '../api'
import { CALLABLE_APP_LIST } from './appList'
import { EntryType, IEntry, INestedFile, IOffsetInfo, IRectInfo, IRootEntry } from '../types'

export * from './constant'

export const entrySorter = (a: IEntry, b: IEntry) => {
  const map = { directory: 1, file: 2 }
  const aVal = map[a.type]
  const bVal = map[b.type]
  const typeDirection = aVal - bVal
  if (typeDirection !== 0) return typeDirection
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const copy = (str: string) => {
  const input = document.createElement('textarea')
  document.body.appendChild(input)
  input.value = str
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
}

export const line = (str: string) => str
  .replace(/\n/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const isSameEntry = (a: IEntry, b: IEntry) => {
  return a.name === b.name && a.type === b.type
}

interface getReadableSizeOption {
  keepFloat?: boolean
  separator?: string
  stepSize?: 1000 | 1024
}

export const getReadableSize = (size: number, options?: getReadableSizeOption) => {
  const {
    keepFloat = false,
    separator = '',
    stepSize = 1024,
  } = options || {}

  const stepList = [stepSize, Math.pow(stepSize, 2), Math.pow(stepSize, 3), Math.pow(stepSize, 4)]

  let unit = ''
  if (!unit) {
    if (0 <= size && size < stepList[0]) {
      unit = 'B'
    } else if (stepList[0] <= size && size < stepList[1]) {
      unit = 'KB'
    } else if (stepList[1] <= size && size < stepList[2]) {
      unit = 'MB'
    } else if (stepList[2] <= size && size < stepList[3]) {
      unit = 'GB'
    } else {
      unit = 'TB'
    }
  }
  const level = ['B', 'KB', 'MB', 'GB', 'TB'].indexOf(unit)
  const divisor = [1, ...stepList][level]
  const fixedSize = (size / divisor).toFixed(unit === 'B' ? 0 : 1)
  const readableSize = keepFloat ? fixedSize : fixedSize.replace('.0', '')
  return `${readableSize}${separator}${unit}`
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
        ? `${singleEntryName}/${singleEntryName}.zip`
        : `${singleEntryName}`
      : `${pathName}.zip`

  const msg = isDownloadAll
    ? `下载当前整个目录为 ${downloadName}`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `下载 ${singleEntryName} 为 ${singleEntryName}.zip`
        : `下载 ${downloadName}`
      : `下载 ${len} 个项目为 ${downloadName}`

  const cmd = isDownloadAll
    ? ''
    : isDownloadSingle
      ? isDownloadSingleDir
        ? ''
        : ''
      : `${selectedEntryList.map(o => `&entry=${o.name}`).join('')}`
  
  return { downloadName, msg, cmd }
}

export const getIsContained = (props: IRectInfo & IOffsetInfo) => {
  const {
    startX,
    startY,
    endX,
    endY,
    offsetTop,
    offsetLeft,
    offsetWidth,
    offsetHeight,
  } = props

  return offsetLeft + offsetWidth > startX &&
    offsetTop + offsetHeight > startY &&
    offsetLeft < endX &&
    offsetTop < endY
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

export const getImageTypeBase64ByURL = async (url: string, options?: { width?: number, height?: number, bgColor?: string, usePNG?: boolean }) => {
  const {
    width,
    height,
    bgColor,
    usePNG = false,
  } = options || {}

  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      const w = width || img.naturalWidth
      const h = height || img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx!.fillStyle = bgColor || 'transparent'
      ctx!.fillRect(0, 0, w, h)
      ctx!.drawImage(img, 0, 0, w, h)
      const base64: string = canvas.toDataURL(`image/${usePNG ? 'png' : 'jpeg'}`, 1)
      resolve(base64)
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.src = url
  })
}

export const openInIINA = (entry: IEntry) => {
  if (!entry) return
  const a = document.createElement('a')
  a.href = `iina://open?url=${encodeURIComponent(FsApi.getFileStreamUrl(entry))}`
  a.click()
}

export const getRootEntryPath = (rootEntry: IRootEntry | null) => {
  if (!rootEntry) return ''
  const { name, parentPath } = rootEntry
  return `${parentPath ? `${parentPath}/` : ''}${name}`
}
