import { Injectable } from '@nestjs/common'
import {
  EntryType,
  IDisk,
  IEntry,
  IRootEntry,
  IRootInfo,
  User,
} from '../../types'
import {
  createReadStream,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import {
  GAGU_PATH,
  GAGU_VERSION,
  getExtension,
  ServerOS,
  GEN_THUMBNAIL_VIDEO_LIST,
  getExists,
  completeNestedPath,
  dataURLtoBuffer,
  getEntryPath,
} from '../../utils'
import * as nodeDiskInfo from 'node-disk-info'
import * as md5 from 'md5'
import * as jsmediatags from 'jsmediatags'
import * as piexifjs from 'piexifjs'
import * as gm from 'gm'
import * as thumbsupply from 'thumbsupply'

@Injectable()
export class FsService {
  constructor() {
    console.log('  - init Fs')
  }

  getHasChildren(path: string) {
    try {
      return readdirSync(path).some((name) => !name.startsWith('.'))
    } catch (err) {
      return false
    }
  }

  getEntryList(path: string) {
    let entryNameList: string[] = []
    try {
      const isWindowsDisk = ServerOS.isWindows && !path.includes('/')
      const _path = isWindowsDisk ? `${path}/` : path
      entryNameList = readdirSync(_path)
    } catch (err) {
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
          const hasChildren = isDirectory && this.getHasChildren(entryPath)
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

  getFlattenRecursiveEntryList(entryList: IEntry[]) {
    const list: IEntry[] = []
    entryList.forEach((entry) => {
      if (entry.type === EntryType.file) {
        list.push(entry)
      } else {
        const subEntryList = this.getEntryList(getEntryPath(entry))
        const subList = this.getFlattenRecursiveEntryList(subEntryList)
        list.push(...subList)
      }
    })
    return list
  }

  getRootInfo(presetDeviceName?: string) {
    const rootEntryList: IRootEntry[] = []
    if (ServerOS.isMacOS) {
      const driveList = nodeDiskInfo
        .getDiskInfoSync()
        .filter((d) => d.mounted.startsWith('/Volumes/'))

      const homeEntry: IRootEntry = {
        name: ServerOS.username,
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
        label: drive.mounted.replace('/Volumes/', ''),
        isDisk: true,
        spaceFree: drive.available * 512,
        spaceTotal: drive.blocks * 512,
      }))

      rootEntryList.push(homeEntry, ...diskList)
    } else if (ServerOS.isWindows) {
      const driveList = nodeDiskInfo.getDiskInfoSync()
      const diskList: IDisk[] = driveList.map((drive) => ({
        name: drive.mounted,
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        parentPath: '',
        hasChildren: true,
        extension: '_dir',
        label: drive.mounted,
        isDisk: true,
        spaceFree: drive.available,
        spaceTotal: drive.blocks,
      }))

      rootEntryList.push(...diskList)
    } else if (ServerOS.isAndroid) {
      rootEntryList.push(
        {
          name: 'home',
          type: EntryType.directory,
          hidden: false,
          lastModified: 0,
          parentPath: '/data/data/com.termux/files',
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
          parentPath: '/data/data/com.termux/files/home/storage',
          hasChildren: true,
          label: 'Shared',
          isDisk: false,
        },
      )
    }

    const rootInfo: IRootInfo = {
      version: GAGU_VERSION,
      serverOS: ServerOS,
      deviceName: presetDeviceName || ServerOS.hostname,
      desktopEntryList: this.getEntryList(`${GAGU_PATH.ROOT}/desktop`),
      rootEntryList,
    }

    return rootInfo
  }

  getDirectorySize(path: string) {
    let size = 0
    const entryList = this.getEntryList(path)
    entryList.forEach((entry) => {
      if (entry.type === EntryType.directory) {
        const recSize = this.getDirectorySize(`${path}/${entry.name}`)
        size += recSize
      } else {
        size += entry.size || 0
      }
    })
    return size
  }

  getTextContent(path: string) {
    return readFileSync(path).toString('utf-8')
  }

  uploadFile(path: string, buffer: Buffer) {
    try {
      completeNestedPath(path)
      writeFileSync(path, buffer)
      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
        message: err.toString(),
      }
    }
  }

  uploadAvatar(username: User.Username, avatar: string) {
    if (avatar) {
      const avatarBuffer = dataURLtoBuffer(avatar)
      const avatarPath = `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
      avatarBuffer && this.uploadFile(avatarPath, avatarBuffer)
    }
  }

  getExif(path: string) {
    const base64 = readFileSync(path).toString('base64')
    const dataURL = `data:image/jpeg;base64,${base64}`
    const exifObj = piexifjs.load(dataURL)
    const exifData: any = {}
    for (const ifd in exifObj) {
      if (ifd === 'thumbnail') {
        continue
      }
      exifData[ifd] = {}
      for (const tag in exifObj[ifd]) {
        const key = (piexifjs as any).TAGS[ifd][tag].name
        const value = exifObj[ifd][tag]
        exifData[ifd][key] = value
      }
    }
    return exifData
  }

  async getTags(path: string) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(path, {
        onSuccess: (tagInfo: any) => {
          const {
            tags: {
              title,
              artist,
              album,
              track,
              picture: { data, format },
              TDRC: { data: recordingTime },
              TDRL: { data: releaseTime },
            },
          } = tagInfo

          let base64String = ''
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i])
          }
          const base64 = `data:${format};base64,${btoa(base64String)}`
          const tagData = {
            title,
            artist,
            album,
            track,
            base64,
            recordingTime,
            releaseTime,
          }

          resolve(tagData)
        },
        onError: (error: any) => {
          reject(error)
        },
      })
    })
  }

  async getThumbnailPath(path: string) {
    const { mtimeMs } = statSync(path)
    const thumbnailId = md5(`${path}-${mtimeMs}`)
    const thumbnailDirPath = `${GAGU_PATH.ROOT}/thumbnail`
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

    return thumbnailFilePath

    // const bitmap = readFileSync(thumbnailFilePath)
    // const base64 = Buffer.from(bitmap).toString('base64')
    // return `data:image/png;base64,${base64}`
  }

  getAvatarPath(username: User.Username) {
    return `${GAGU_PATH.ROOT}/public/avatar/${username}`
  }
}
