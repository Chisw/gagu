import * as os from 'os'

const platform = os.platform()

export const GAGU_VERSION = '0.0.24'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const OS = {
  username: process.env.USER || os.userInfo().username,
  hostname: os.hostname(),
  platform,
  isMacOS: platform === 'darwin',
  isWindows: platform === 'win32',
  isAndroid: platform === 'android',
}

// Sync BE & FE
export const GEN_THUMBNAIL_VIDEO_LIST = ['mp4', 'mkv', 'avi', 'rm', 'rmvb']
export const GEN_THUMBNAIL_IMAGE_LIST = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'ico',
  'pbm',
  'svg',
]

export const GEN_THUMBNAIL_LIST = [
  ...GEN_THUMBNAIL_VIDEO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]

export const PATH_MAP: { [PLATFORM: string]: string } = {
  darwin: `/Users/${OS.username}/.io.gagu`,
  win32: `C:/Users/${OS.username}/.io.gagu`,
  android: `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`,
}

export const ROOT_PATH = PATH_MAP[OS.platform] || ''

export const GAGU_PATH = {
  ROOT: ROOT_PATH,
  USERS_DATA: `${ROOT_PATH}/data/users.json`,
  LOGIN_DATA: `${ROOT_PATH}/data/login.json`,
  PUBLIC_AVATAR: `${ROOT_PATH}/public/avatar`,
}

export const HELP_INFO = `
Usage:
  gagu          // Start service
  gagu -h       // Show help info, --help
  gagu -o       // Start and open in browser, --open
  gagu -p 8888  // Start with customized port, --port
  gagu -v       // Show version, --version
  gagu --reset  // Reset with removing GAGU root directory
`
