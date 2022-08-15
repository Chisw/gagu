import {
  readdirSync,
  statSync,
  // rmdirSync,
  unlinkSync,
  renameSync,
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  createReadStream,
  writeFileSync,
} from 'fs'
import { createGzip } from 'zlib'
import { IEntry } from 'src/types'
import { exec } from 'child_process'

export const getHasChildren = (path: string) => {
  try {
    return readdirSync(path).filter((name) => !name.startsWith('.')).length > 0
  } catch (err) {
    return false
  }
}

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
        const hasChildren = isDirectory && getHasChildren(entryPath)
        return {
          name: entryName,
          type,
          size,
          hidden,
          lastModified,
          hasChildren,
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
    // rmdirSync(path)
    exec(`rm -rf ${path}`)
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

export const completeNestedPathList = (path: string) => {
  const list = path.split('/').filter(Boolean).slice(0, -1)
  const nestedPathList = list.map((dirName, index) => {
    const prefix = '/' + list.filter((d, i) => i < index).join('/')
    return `${prefix}/${dirName}`
  })
  nestedPathList.forEach((path) => {
    const exists = getExists(path)
    if (!exists) {
      addDirectory(path)
    }
  })
}

export const uploadFile = (path: string, buffer: Buffer) => {
  try {
    completeNestedPathList(path)
    writeFileSync(path, buffer)
    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
      msg: err.toString(),
    }
  }
}

export const gzipEntryList = async (entryPathList: string[]) => {
  for (const entryPath of entryPathList) {
    const readStream = createReadStream(entryPath)
    await readStream.pipe(createGzip())
  }
}
