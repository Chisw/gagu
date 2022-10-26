import * as os from 'os'

const platform = os.platform()

export const GAGU_VERSION = '0.0.28'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const OS = {
  username: process.env.USER || os.userInfo().username,
  hostname: os.hostname(),
  platform,
  isMacOS: platform === 'darwin',
  isWindows: platform === 'win32',
  isAndroid: platform === 'android',
}

export const PATH_MAP: { [PLATFORM: string]: string } = {
  darwin: `/Users/${OS.username}/.io.gagu`,
  win32: `C:/Users/${OS.username}/.io.gagu`,
  android: `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`,
}

export const ROOT_PATH = (PATH_MAP[OS.platform] || '') + (IS_DEV ? '.dev' : '')

export const GAGU_PATH = {
  ROOT: ROOT_PATH,
  DATA_USERS: `${ROOT_PATH}/data/users.json`,
  DATA_AUTH: `${ROOT_PATH}/data/auth.json`,
  DATA_DOWNLOADS: `${ROOT_PATH}/data/downloads.json`,
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

// Sync following code to BE & FE
export const PULSE_INTERVAL = 60 * 1000
export const HEADERS_AUTH_KEY = 'Authorization'
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

export const SERVER_MESSAGE_MAP = {
  OK: 'OK',
  ERROR_PASSWORD_WRONG: 'ERROR_PASSWORD_WRONG',
  ERROR_USER_NOT_EXISTED: 'ERROR_USER_NOT_EXISTED',
  ERROR_USER_EXISTED: 'ERROR_USER_EXISTED',
  ERROR_USER_DISABLED: 'ERROR_USER_DISABLED',
  ERROR_USER_EXPIRED: 'ERROR_USER_EXPIRED',
  ERROR_TOKEN_INVALID: 'ERROR_TOKEN_INVALID',
  ERROR_TUNNEL_NOT_EXISTED: 'ERROR_TUNNEL_NOT_EXISTED',
  ERROR_EXIF: 'ERROR_EXIF',
  ERROR_TAGS: 'ERROR_TAGS',
}
