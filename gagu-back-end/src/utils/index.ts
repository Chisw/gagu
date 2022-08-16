import * as os from 'os'
import { EntryType, IEntry, IRootEntry, IVolume } from './types'
// import { mkdirSync } from 'fs'
import * as nodeDiskInfo from 'node-disk-info'
import { SetMetadata } from '@nestjs/common'
import { completeNestedPath } from './fs'

export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_API_PUBLIC_KEY = 'IS_API_PUBLIC_KEY'
export const USERNAME = process.env.USER || os.userInfo().username
export const HOSTNAME = os.hostname()
export const PLATFORM = os.platform()

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
if (PLATFORM === 'darwin') {
  gaguConfigPath = `/Users/${USERNAME}/.io.gagu`
} else if (PLATFORM === 'android') {
  gaguConfigPath = `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`
} else if (PLATFORM === 'win32') {
  gaguConfigPath = `C:/Programs Files/.io.gagu`
}
export const GAGU_CONFIG_PATH = gaguConfigPath

export const Public = () => SetMetadata(IS_API_PUBLIC_KEY, true)

export const hashCode = (str: string) => {
  let hash = 0
  if (str.length === 0) return '0'
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return Math.abs(hash as number).toString(36) as string
}

export const getExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return ''
  return name.split('.').reverse()[0].toLowerCase()
}

export const getRootEntryList = () => {
  const rootEntryList: IEntry[] = []
  const diskInfo = nodeDiskInfo.getDiskInfoSync()

  if (PLATFORM === 'darwin') {
    const driveList = diskInfo.filter((d) => d.mounted.startsWith('/Volumes/'))

    const homeEntry: IRootEntry = {
      name: 'Home',
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      extension: '_dir',
      parentPath: '/Users',
      hasChildren: true,
      mounted: `/Users/${USERNAME}`,
      isVolume: false,
    }

    const volumeList: IVolume[] = driveList.map((drive) => ({
      name: drive.mounted.replace('/Volumes/', ''),
      type: EntryType.directory,
      hidden: false,
      lastModified: 0,
      parentPath: '/Volumes',
      hasChildren: true,
      extension: '_dir',
      mounted: drive.mounted,
      isVolume: true,
      spaceFree: drive.available * 512,
      spaceTotal: drive.blocks * 512,
    }))

    rootEntryList.push(homeEntry, ...volumeList)
  } else if (PLATFORM === 'android') {
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
        isVolume: false,
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
        isVolume: false,
      },
    )
  }
  return rootEntryList
}

export const initConfig = () => {
  completeNestedPath(`${GAGU_CONFIG_PATH}/thumbnail/PLACEHOLDER`)
}
