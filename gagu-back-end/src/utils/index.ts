import * as os from 'os'
import * as nodeDiskInfo from 'node-disk-info'
import * as md5 from 'md5'
import * as thumbsupply from 'thumbsupply'
import * as gm from 'gm'
import { SetMetadata } from '@nestjs/common'
import { exec, spawn } from 'child_process'
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
import {
  IEntry,
  EntryType,
  IRootEntry,
  IDisk,
  IUser,
  IUserListData,
} from 'src/utils/types'

export const GAGU_VERSION = 'v0.0.17'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_API_PUBLIC_KEY = 'IS_API_PUBLIC_KEY'

const platform = os.platform()
export const OS = {
  username: process.env.USER || os.userInfo().username,
  hostname: os.hostname(),
  platform,
  isMacOS: platform === 'darwin',
  isWindows: platform === 'win32',
  isAndroid: platform === 'android',
}

// sync back and front
export const GEN_THUMBNAIL_VIDEO_LIST = ['mp4', 'mkv', 'avi', 'rm', 'rmvb']
export const GEN_THUMBNAIL_IMAGE_LIST = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'pbm',
  'bmp',
]
export const GEN_THUMBNAIL_LIST = [
  ...GEN_THUMBNAIL_VIDEO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]

let gaguConfigPath = ''
if (OS.isMacOS) {
  gaguConfigPath = `/Users/${OS.username}/.io.gagu`
} else if (OS.isWindows) {
  gaguConfigPath = `C:/Users/${OS.username}/.io.gagu`
} else if (OS.isAndroid) {
  gaguConfigPath = `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`
}
export const GAGU_CONFIG_PATH = gaguConfigPath
export const USER_LIST_DATA_PATH = `${GAGU_CONFIG_PATH}/data/users.json`

export const Public = () => SetMetadata(IS_API_PUBLIC_KEY, true)

export const getExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return ''
  return name.split('.').reverse()[0].toLowerCase()
}

export const openInBrowser = (url: string) => {
  if (OS.isMacOS) {
    exec(`open ${url}`)
  } else if (OS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

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

export const writeUserListData = (userList: IUser[]) => {
  const userListData: IUserListData = {
    version: GAGU_VERSION,
    userList,
  }
  writeFileSync(USER_LIST_DATA_PATH, JSON.stringify(userListData))
}

export const readUserListData = () => {
  const dataStr = readFileSync(USER_LIST_DATA_PATH).toString('utf-8')
  const userListData: IUserListData = JSON.parse(dataStr)
  return userListData
}

export const initConfig = () => {
  completeNestedPath(`${GAGU_CONFIG_PATH}/thumbnail/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/data/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/log/PLACEHOLDER`)
  if (!getExists(USER_LIST_DATA_PATH)) {
    const adminUser: IUser = {
      isAdmin: true,
      username: 'gagu',
      password: md5('9293'),
      avatar: '',
      rootEntryList: [],
      permissionList: [],
      validUntil: 0,
    }
    writeUserListData([adminUser])
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
