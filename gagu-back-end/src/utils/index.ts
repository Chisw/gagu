import {
  readdirSync,
  statSync,
  rmdirSync,
  unlinkSync,
  renameSync,
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
} from 'fs'
import { IEntry } from 'src/types'

export const getEntryList = (path: string) => {
  let entryNameList: string[] = []
  try {
    entryNameList = readdirSync(path)
  } catch (err) {
    console.log('ERR:', 'getEntryList', err)
    return []
  }
  const entryList = entryNameList
    .map((entryName: string) => {
      try {
        const entryPath = `${path}/${entryName}`
        const stat = statSync(entryPath)
        const isDirectory = stat.isDirectory()
        const type = isDirectory ? 'directory' : 'file'
        const size = isDirectory ? undefined : stat.size
        const hidden = entryName.startsWith('.')
        const lastModified = stat.ctimeMs
        return {
          name: entryName,
          type,
          size,
          hidden,
          lastModified,
          hasChildren: false,
        }
      } catch (err) {
        console.log('ERR:', 'getEntryList', err)
        return null
      }
    })
    .filter(Boolean) as IEntry[]
  return entryList
}

export const getDirectorySize = (path: string) => {
  let size = 0
  const entryList = getEntryList(path)
  entryList.forEach((entry) => {
    if (entry.type === 'directory') {
      const recSize = getDirectorySize(`${path}/${entry.name}`)
      size += recSize
    } else {
      size += entry.size || 0
    }
  })
  return size
}

export const deleteEntry = (path: string) => {
  const stat = statSync(path)
  if (stat.isDirectory()) {
    rmdirSync(path)
  } else {
    unlinkSync(path)
  }
}

export const getExists = (path: string) => {
  let exists = false
  try {
    accessSync(path, constants.F_OK)
    exists = true
  } catch (err) {
    exists = false
  }
  return exists
}

export const renameEntry = (oldPath: string, newPath: string) => {
  renameSync(oldPath, newPath)
}

export const addDirectory = (path: string) => {
  mkdirSync(path)
}

export const getTextContent = (path: string) => {
  return readFileSync(path).toString('utf-8')
}
