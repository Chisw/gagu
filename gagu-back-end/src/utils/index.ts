import * as os from 'os'
import { SetMetadata } from '@nestjs/common'

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
  gaguConfigPath = `C:/Programs Files/.io.gagu`
} else if (OS.isAndroid) {
  gaguConfigPath = `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`
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
