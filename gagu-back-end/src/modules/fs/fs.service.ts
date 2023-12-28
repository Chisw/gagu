import { Injectable } from '@nestjs/common'
import {
  EntryType,
  IAudioTag,
  IDisk,
  IEntry,
  IExif,
  IRootEntry,
  RootEntryGroup,
  User,
} from '../../types'
import {
  createReadStream,
  createWriteStream,
  promises,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import {
  GAGU_PATH,
  getExtension,
  ServerOS,
  GEN_THUMBNAIL_VIDEO_LIST,
  getExists,
  completeNestedPath,
  dataURLtoBuffer,
  getEntryPath,
  FORBIDDEN_ENTRY_NAME_LIST,
  GEN_THUMBNAIL_AUDIO_LIST,
  catchError,
  GEN_THUMBNAIL_IMAGE_LIST,
} from '../../utils'
import * as nodeDiskInfo from 'node-disk-info'
import * as md5 from 'md5'
import * as jsmediatags from 'jsmediatags'
import * as piexifjs from 'piexifjs'
import * as gm from 'gm'
import * as thumbsupply from 'thumbsupply'

@Injectable()
export class FsService {
  getHasChildren(path: string) {
    try {
      return readdirSync(path).some((name) => !name.startsWith('.'))
    } catch (error) {
      catchError(error)
      return false
    }
  }

  getEntryList(path: string) {
    let entryNameList: string[] = []
    try {
      const isWindowsDisk = ServerOS.isWindows && !path.includes('/')
      const _path = isWindowsDisk ? `${path}/` : path
      entryNameList = readdirSync(_path)
    } catch (error) {
      catchError(error)
      return []
    }
    const entryList = entryNameList
      .filter((entryName: string) => {
        const isForbidden = FORBIDDEN_ENTRY_NAME_LIST.includes(entryName)
        const isMacHiddenEntries =
          ServerOS.isMacOS &&
          ['.Trash', '.Trashes', '.Spotlight-V100'].includes(entryName)
        return !isForbidden && !isMacHiddenEntries
      })
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
        } catch (error) {
          catchError(error)
          return null
        }
      })
      .filter(Boolean) as IEntry[]
    return entryList
  }

  getRecursiveFlattenEntryList(entryList: IEntry[]) {
    const list: IEntry[] = []
    entryList.forEach((entry) => {
      if (entry.type === EntryType.file) {
        list.push(entry)
      } else {
        const subEntryList = this.getEntryList(getEntryPath(entry))
        const subList = this.getRecursiveFlattenEntryList(subEntryList)
        list.push(...subList)
      }
    })
    return list
  }

  getRootEntryList() {
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
        group: RootEntryGroup.system,
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
        group: RootEntryGroup.system,
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
        group: RootEntryGroup.system,
        isDisk: true,
        spaceFree: drive.available,
        spaceTotal: drive.blocks,
      }))

      rootEntryList.push(...diskList)
    } else if (ServerOS.isLinux) {
      const homeEntry: IRootEntry = {
        name: ServerOS.username,
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        extension: '_dir',
        parentPath: '/home',
        hasChildren: true,
        group: RootEntryGroup.system,
        isDisk: false,
      }

      const driveList = nodeDiskInfo.getDiskInfoSync()

      const diskList: IDisk[] = driveList.map((drive) => ({
        name: drive.mounted.replace('/Volumes/', ''),
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        parentPath: '/Volumes',
        hasChildren: true,
        extension: '_dir',
        label: drive.mounted.replace('/Volumes/', ''),
        group: RootEntryGroup.system,
        isDisk: true,
        spaceFree: drive.available * 512,
        spaceTotal: drive.blocks * 512,
      }))

      rootEntryList.push(homeEntry, ...diskList)
    } else if (ServerOS.isAndroid) {
      rootEntryList.push(
        {
          name: 'shared',
          type: EntryType.directory,
          hidden: false,
          lastModified: 0,
          extension: '_dir',
          parentPath: '/data/data/com.termux/files/home/storage',
          hasChildren: true,
          group: RootEntryGroup.system,
          isDisk: false,
        },
        {
          name: 'home',
          type: EntryType.directory,
          hidden: false,
          lastModified: 0,
          parentPath: '/data/data/com.termux/files',
          hasChildren: true,
          extension: '_dir',
          group: RootEntryGroup.system,
          isDisk: false,
        },
        {
          name: 'com.termux',
          type: EntryType.directory,
          hidden: false,
          lastModified: 0,
          parentPath: '/data/data',
          hasChildren: true,
          extension: '_dir',
          group: RootEntryGroup.system,
          isDisk: false,
        },
      )
    }

    return rootEntryList
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
    completeNestedPath(path)

    return new Promise((resolve, reject) => {
      const stream = createWriteStream(path)

      stream.on('open', () => {
        const chunkSize = 128
        const bufferLength = buffer.length
        const count = Math.ceil(bufferLength / chunkSize)
        for (let i = 0; i < count; i++) {
          const chunk = buffer.slice(
            chunkSize * i,
            Math.min(chunkSize * (i + 1), bufferLength),
          )
          stream.write(chunk)
        }
        stream.end()
      })
      stream.on('error', (error) => reject(error))
      stream.on('finish', () => resolve(true))
    })
  }

  uploadImage(name: string, buffer: Buffer) {
    writeFileSync(`${GAGU_PATH.PUBLIC_IMAGE}/${name}`, buffer)
  }

  uploadAvatar(username: User.Username, avatar: string) {
    if (avatar) {
      const avatarBuffer = dataURLtoBuffer(avatar)
      const avatarPath = `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
      avatarBuffer && this.uploadFile(avatarPath, avatarBuffer)
    }
  }

  async moveEntry(oldPath: string, newPath: string) {
    try {
      await promises.cp(oldPath, newPath, { recursive: true })
      await promises.rm(oldPath, { recursive: true })
    } catch (error) {
      catchError(error)
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
    return exifData as IExif
  }

  async getAudioTags(path: string) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(path, {
        onSuccess: (tagInfo: any) => {
          const {
            tags: { title, artist, album, track, picture, TDRC, TDRL },
          } = tagInfo

          const { data: recordingTime } = TDRC || {}
          const { data: releaseTime } = TDRL || {}

          let coverBase64: string | undefined = undefined

          if (picture) {
            const { data, format } = picture
            let base64String = ''
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i])
            }
            coverBase64 = `data:${format};base64,${btoa(base64String)}`
          }

          const tagData: IAudioTag = {
            title,
            artist,
            album,
            track,
            coverBase64,
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
    const thumbnailFolderPath = GAGU_PATH.THUMBNAIL
    const thumbnailFilePath = `${thumbnailFolderPath}/${thumbnailId}`

    if (!getExists(thumbnailFilePath)) {
      let convertionTargetPath = ''

      const extension = getExtension(path)
      const isGenImage = GEN_THUMBNAIL_IMAGE_LIST.includes(extension)
      const isGenVideo = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
      const isGenAudio = GEN_THUMBNAIL_AUDIO_LIST.includes(extension)

      if (isGenImage) {
        convertionTargetPath = path
      } else if (isGenVideo) {
        const screenshotPath = await thumbsupply.generateThumbnail(path, {
          size: thumbsupply.ThumbSize.MEDIUM,
          timestamp: '10%',
          mimetype: 'video/mp4',
          cacheDir: thumbnailFolderPath,
        })
        convertionTargetPath = screenshotPath
      } else if (isGenAudio) {
        const tagData: IAudioTag | any = await this.getAudioTags(path)
        const base64 = tagData?.coverBase64
        if (base64) {
          const buffer = dataURLtoBuffer(base64)
          buffer && writeFileSync(thumbnailFilePath, buffer)
          convertionTargetPath = thumbnailFilePath
        }
      }

      if (!convertionTargetPath) {
        return ''
      }

      await new Promise(async (resolve, reject) => {
        gm(createReadStream(convertionTargetPath))
          .selectFrame(4)
          .resize(100)
          .noProfile()
          .write(thumbnailFilePath, (error) => {
            if (error) {
              reject(error)
            } else {
              resolve(thumbnailFilePath)
              isGenVideo && unlinkSync(convertionTargetPath)
            }
          })
      })
    }

    return thumbnailFilePath
  }

  getAvatarPath(username: User.Username) {
    return `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
  }

  getImagePath(name: string) {
    return `${GAGU_PATH.PUBLIC_IMAGE}/${name}`
  }
}
