import { Injectable } from '@nestjs/common'
import {
  EntryType,
  IAudioInfo,
  IDisk,
  IEntry,
  IExifInfo,
  IRootEntry,
  RootEntryGroup,
  ThumbnailType,
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
  getExists,
  completeNestedPath,
  dataURLtoBuffer,
  getEntryPath,
  catchError,
  MAC_HIDDEN_ENTRIES,
  GEN_THUMBNAIL_MAP,
} from '../../utils'
import * as nodeDiskInfo from 'node-disk-info'
import * as md5 from 'md5'
import * as piexifjs from 'piexifjs'
import { parseFile } from 'music-metadata'
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
        const isFiltered = `${path}/${entryName}` === GAGU_PATH.ROOT
        const isMacHidden =
          ServerOS.isMacOS && MAC_HIDDEN_ENTRIES.includes(entryName)

        return !isFiltered && !isMacHidden
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

  getRecursiveFlatEntryList(entryList: IEntry[]) {
    const list: IEntry[] = []
    entryList.forEach((entry) => {
      if (entry.type === EntryType.file) {
        list.push(entry)
      } else {
        const subEntryList = this.getEntryList(getEntryPath(entry))
        const subList = this.getRecursiveFlatEntryList(subEntryList)
        list.push(...subList)
      }
    })
    return list
  }

  getSystemRootEntryList() {
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

      const systemDiskEntry: IRootEntry = {
        name: 'Macintosh HD',
        type: EntryType.directory,
        hidden: false,
        lastModified: 0,
        extension: '_dir',
        parentPath: '/Volumes',
        hasChildren: true,
        group: RootEntryGroup.system,
        isDisk: true,
        spaceFree: 0,
        spaceTotal: 0,
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

      rootEntryList.push(homeEntry, systemDiskEntry, ...diskList)
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

  async moveEntry(fromPath: string, toPath: string) {
    try {
      await promises.cp(fromPath, toPath, { recursive: true })
      await promises.rm(fromPath, { recursive: true })
    } catch (error) {
      catchError(error)
    }
  }

  async copyEntry(fromPath: string, toPath: string) {
    try {
      await promises.cp(fromPath, toPath, { recursive: true })
    } catch (error) {
      catchError(error)
    }
  }

  getExifInfo(path: string) {
    const base64 = readFileSync(path).toString('base64')
    const dataURL = `data:image/jpeg;base64,${base64}`
    const exifObj = piexifjs.load(dataURL)
    const info: any = {}
    for (const ifd in exifObj) {
      if (ifd === 'thumbnail') {
        continue
      }
      info[ifd] = {}
      for (const tag in exifObj[ifd]) {
        const key = (piexifjs as any).TAGS[ifd][tag].name
        const value = exifObj[ifd][tag]
        info[ifd][key] = value
      }
    }
    return info as IExifInfo
  }

  async getAudioInfo(path: string) {
    const {
      common: { title, artist, album, track, picture },
    } = await parseFile(path)

    let coverBase64: string | undefined = undefined

    if (picture && picture[0]) {
      const { format, data } = picture[0]
      coverBase64 = `data:${format};base64,${data.toString('base64')}`
    }

    const info: IAudioInfo = {
      title,
      artist,
      album,
      track: `${track.no}/${track.of}`,
      coverBase64,
    }

    return info
  }

  async getThumbnailPath(path: string) {
    const { mtimeMs } = statSync(path)
    const thumbnailId = md5(`${path}-${mtimeMs}`)
    const thumbnailParentPath = GAGU_PATH.THUMBNAIL
    const thumbnailPath = `${thumbnailParentPath}/${thumbnailId}`

    if (!getExists(thumbnailPath)) {
      let convertionTargetPath = ''

      const extension = getExtension(path)
      const thumbnailType = GEN_THUMBNAIL_MAP[extension]
      const isDocument = thumbnailType === ThumbnailType.document
      const isImage = thumbnailType === ThumbnailType.image
      const isAudio = thumbnailType === ThumbnailType.audio
      const isVideo = thumbnailType === ThumbnailType.video

      if (isDocument) {
        convertionTargetPath = path
      } else if (isImage) {
        convertionTargetPath = path
      } else if (isAudio) {
        const info: IAudioInfo | any = await this.getAudioInfo(path)
        const base64 = info?.coverBase64
        if (base64) {
          const buffer = dataURLtoBuffer(base64)
          buffer && writeFileSync(thumbnailPath, buffer)
          convertionTargetPath = thumbnailPath
        }
      } else if (isVideo) {
        const screenshotPath = await thumbsupply.generateThumbnail(path, {
          size: thumbsupply.ThumbSize.MEDIUM,
          timestamp: '10%',
          mimetype: 'video/mp4',
          cacheDir: thumbnailParentPath,
        })
        convertionTargetPath = screenshotPath
      }

      if (!convertionTargetPath) {
        return ''
      }

      await new Promise(async (resolve, reject) => {
        gm(createReadStream(convertionTargetPath))
          .selectFrame(extension === 'gif' ? 4 : 0)
          .setFormat('jpg')
          .resize(100)
          .noProfile()
          .write(thumbnailPath, (error) => {
            if (error) {
              reject(error)
            } else {
              resolve(thumbnailPath)
              isVideo && unlinkSync(convertionTargetPath)
            }
          })
      })
    }

    return thumbnailPath
  }

  uploadAvatar(username: User.Username, avatar: string) {
    if (avatar) {
      const avatarBuffer = dataURLtoBuffer(avatar)
      const avatarPath = `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
      avatarBuffer && this.uploadFile(avatarPath, avatarBuffer)
    }
  }

  createPublicImage(name: string, buffer: Buffer) {
    writeFileSync(`${GAGU_PATH.PUBLIC_IMAGE}/${name}`, buffer)
  }

  getAvatarPath(username: User.Username) {
    return `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
  }

  getImagePath(name: string) {
    return `${GAGU_PATH.PUBLIC_IMAGE}/${name}`
  }
}
