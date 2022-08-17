import {
  readdirSync,
  statSync,
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
import { IEntry, EntryType, IRootEntry, IDisk } from 'src/utils/types'
import { exec } from 'child_process'
import { GAGU_CONFIG_PATH, GEN_THUMBNAIL_VIDEO_LIST, OS } from './index'
import { getExtension } from './index'
import * as nodeDiskInfo from 'node-disk-info'
import * as md5 from 'md5'
import * as thumbsupply from 'thumbsupply'
import * as gm from 'gm'

export const getHasChildren = (path: string) => {
  try {
    return readdirSync(path).filter((name) => !name.startsWith('.')).length > 0
  } catch (err) {
    return false
  }
}

export const getRootEntryList = () => {
  const rootEntryList: IEntry[] = []
  if (OS.isMacOS) {
    const driveList = nodeDiskInfo
      .getDiskInfoSync()
      .filter((d) => d.mounted.startsWith('/Volumes/'))

    const homeEntry: IRootEntry = {
      name: 'Home',
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      extension: '_dir',
      parentPath: '/Users',
      hasChildren: true,
      mounted: `/Users/${OS.username}`,
      isDisk: false,
    }

    const diskList: IDisk[] = driveList.map((drive) => ({
      name: drive.mounted.replace('/Volumes/', ''),
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      parentPath: '/Volumes',
      hasChildren: true,
      extension: '_dir',
      mounted: drive.mounted,
      isDisk: true,
      spaceFree: drive.available * 512,
      spaceTotal: drive.blocks * 512,
    }))

    rootEntryList.push(homeEntry, ...diskList)
  } else if (OS.isWindows) {
    const driveList = nodeDiskInfo.getDiskInfoSync()
    const diskList: IDisk[] = driveList.map((drive) => ({
      name: drive.mounted,
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      parentPath: '',
      hasChildren: true,
      extension: '_dir',
      mounted: drive.mounted,
      isDisk: true,
      spaceFree: drive.available * 512,
      spaceTotal: drive.blocks * 512,
    }))

    rootEntryList.push(...diskList)
  } else if (OS.isAndroid) {
    rootEntryList.push(
      {
        name: 'Home',
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        parentPath: '/data/data/com.termux/files/',
        hasChildren: true,
        extension: '_dir',
        mounted: '/data/data/com.termux/files/home',
        isDisk: false,
      },
      {
        name: 'Shared',
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        extension: '_dir',
        parentPath: '/data/data/com.termux/files/home/storage/',
        hasChildren: true,
        mounted: '/data/data/com.termux/files/home/storage/shared',
        isDisk: false,
      },
    )
  }
  return rootEntryList
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
        const type = isDirectory ? EntryType.directory : EntryType.file
        const size = isDirectory ? undefined : stat.size
        const hidden = entryName.startsWith('.')
        const lastModified = stat.ctimeMs
        const hasChildren = isDirectory && getHasChildren(entryPath)
        const extension = isDirectory
          ? `_dir${hasChildren ? '' : '_empty'}`
          : getExtension(entryName)
        const entry: IEntry = {
          name: entryName,
          type,
          size,
          hidden,
          lastModified,
          parentPath: path,
          hasChildren,
          extension,
        }
        return entry
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
    if (entry.type === EntryType.directory) {
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

export const getThumbnail = async (path: string) => {
  const { mtimeMs } = statSync(path)
  const thumbnailId = md5(`${path}-${mtimeMs}`)
  const thumbnailPath = `${GAGU_CONFIG_PATH}/thumbnail/${thumbnailId}`

  if (getExists(thumbnailPath)) {
    return thumbnailPath
  }

  const extension = getExtension(path)
  let targetPath = path

  const isGenVideo = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
  if (isGenVideo) {
    const cacheThumbnailPath = await thumbsupply.generateThumbnail(path, {
      size: thumbsupply.ThumbSize.MEDIUM,
      timestamp: '10%',
      mimetype: 'video/mp4',
      cacheDir: `${GAGU_CONFIG_PATH}/thumbnail`,
    })
    targetPath = cacheThumbnailPath
  }

  await new Promise(async (resolve, reject) => {
    gm(createReadStream(targetPath))
      .selectFrame(4)
      .resize(48)
      .noProfile()
      .write(thumbnailPath, (err) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(thumbnailPath)
          isGenVideo && unlinkSync(targetPath)
        }
      })
  })
  return thumbnailPath
}

export const completeNestedPath = (path: string) => {
  const list = path.split('/').filter(Boolean).slice(0, -1)
  const nestedPathList = list.map((dirName, index) => {
    const prefix = '/' + list.filter((d, i) => i < index).join('/')
    return `${prefix}/${dirName}`
  })
  nestedPathList.forEach((path) => {
    const p = OS.isWindows ? path.replace('/', '') : path
    const exists = getExists(p)
    !exists && addDirectory(p)
  })
}

export const initConfig = () => {
  completeNestedPath(`${GAGU_CONFIG_PATH}/thumbnail/PLACEHOLDER`)
}

export const uploadFile = (path: string, buffer: Buffer) => {
  try {
    completeNestedPath(path)
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
