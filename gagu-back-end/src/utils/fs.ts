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
import { IEntry, EntryType, IRootEntry, IDisk, IUser } from 'src/utils/types'
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
  const rootEntryList: IRootEntry[] = []
  if (OS.isMacOS) {
    const driveList = nodeDiskInfo
      .getDiskInfoSync()
      .filter((d) => d.mounted.startsWith('/Volumes/'))

    const homeEntry: IRootEntry = {
      name: OS.username,
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      extension: '_dir',
      parentPath: '/Users',
      hasChildren: true,
      label: 'Home',
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
      label: drive.mounted.replace('/Volumes/', ''),
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
      label: drive.mounted,
      isDisk: true,
      spaceFree: drive.available * 512,
      spaceTotal: drive.blocks * 512,
    }))

    rootEntryList.push(...diskList)
  } else if (OS.isAndroid) {
    rootEntryList.push(
      {
        name: 'home',
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        parentPath: '/data/data/com.termux/files/',
        hasChildren: true,
        extension: '_dir',
        label: 'Home',
        isDisk: false,
      },
      {
        name: 'shared',
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        extension: '_dir',
        parentPath: '/data/data/com.termux/files/home/storage/',
        hasChildren: true,
        label: 'Shared',
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

export const getThumbnailBase64 = async (path: string) => {
  const { mtimeMs } = statSync(path)
  const thumbnailId = md5(`${path}-${mtimeMs}`)
  const thumbnailDirPath = `${GAGU_CONFIG_PATH}/thumbnail`
  const thumbnailFilePath = `${thumbnailDirPath}/${thumbnailId}`

  if (!getExists(thumbnailFilePath)) {
    const extension = getExtension(path)
    let targetPath = path

    const isGenVideo = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
    if (isGenVideo) {
      const cacheThumbnailPath = await thumbsupply.generateThumbnail(path, {
        size: thumbsupply.ThumbSize.MEDIUM,
        timestamp: '10%',
        mimetype: 'video/mp4',
        cacheDir: thumbnailDirPath,
      })
      targetPath = cacheThumbnailPath
    }

    await new Promise(async (resolve, reject) => {
      gm(createReadStream(targetPath))
        .selectFrame(4)
        .resize(100)
        .noProfile()
        .write(thumbnailFilePath, (err) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            resolve(thumbnailFilePath)
            isGenVideo && unlinkSync(targetPath)
          }
        })
    })
  }

  const bitmap = readFileSync(thumbnailFilePath)
  const base64 = Buffer.from(bitmap).toString('base64')
  return `data:image/png;base64,${base64}`
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
  completeNestedPath(`${GAGU_CONFIG_PATH}/data/PLACEHOLDER`)
  const userListDataPath = `${GAGU_CONFIG_PATH}/data/users.json`
  if (!getExists(userListDataPath)) {
    const admin: IUser = {
      isAdmin: true,
      username: 'gagu',
      password: md5('9293'),
      avatar: '',
      rootEntryList: [],
      permissionList: [],
      validUntil: 0,
    }
    writeFileSync(userListDataPath, JSON.stringify({
      version: '0.0.18',
      userList: [admin],
    }))
  }
  const userListData = readFileSync(userListDataPath).toString('utf-8')
  const userList = JSON.parse(userListData)
  return {
    userList,
  }
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
