import * as os from 'os'

export const GAGU_VERSION = 'v0.0.24'
export const IS_DEV = process.env.NODE_ENV === 'development'

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
  'svg',
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
