import * as os from 'os'
import { IServerOS } from 'src/types'

const platform = os.platform()
const hostname = os.hostname()

export const HOST = (() => {
  const iFaces = os.networkInterfaces()
  const ipList: string[] = []
  for (const dev in iFaces) {
    iFaces[dev]?.forEach(function (details) {
      if (details.family === 'IPv4' && !details.internal) {
        ipList.push(details.address)
      }
    })
  }
  ipList.sort((ip1) => (ip1.indexOf('192') >= 0 ? -1 : 1))
  return ipList[0] || '127.0.0.1'
})()

export const GAGU_VERSION = '0.0.33'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const ServerOS: IServerOS = {
  username: process.env.USER || os.userInfo().username,
  host: HOST,
  hostname,
  platform,
  isMacOS: platform === 'darwin',
  isWindows: platform === 'win32',
  isAndroid: platform === 'android',
}

export const PATH_MAP: { [PLATFORM: string]: string } = {
  darwin: `/Users/${ServerOS.username}/.io.gagu`,
  win32: `C:/Users/${ServerOS.username}/.io.gagu`,
  android: `/data/data/com.termux/files/home/storage/shared/Android/.io.gagu`,
}

export const ROOT_PATH =
  (PATH_MAP[ServerOS.platform] || '') + (IS_DEV ? '.dev' : '')

export const GAGU_PATH = {
  ROOT: ROOT_PATH,
  DATA: `${ROOT_PATH}/data`,
  DATA_USERS: `${ROOT_PATH}/data/users.json`,
  DATA_AUTH: `${ROOT_PATH}/data/auth.json`,
  DATA_TUNNELS: `${ROOT_PATH}/data/tunnels.json`,
  DATA_SETTINGS: `${ROOT_PATH}/data/settings.json`,
  PUBLIC_AVATAR: `${ROOT_PATH}/public/avatar`,
}

export const HELP_INFO = `
Usage:
  gagu          // Start service
  gagu -h       // Show help info, --help
  gagu -o       // Start and open in browser, --open
  gagu -p 8888  // Start with customized port, --port
  gagu -v       // Show version, --version
  gagu --reset  // Reset with removing GAGU data directory
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
  ERROR_TUNNEL_NO_LEFT: 'ERROR_TUNNEL_NO_LEFT',
  ERROR_TUNNEL_EXPIRED: 'ERROR_TUNNEL_EXPIRED',
  ERROR_TUNNEL_PASSWORD_WRONG: 'ERROR_TUNNEL_PASSWORD_WRONG',
  ERROR_TUNNEL_PASSWORD_NEEDED: 'ERROR_TUNNEL_PASSWORD_NEEDED',
  ERROR_EXIF: 'ERROR_EXIF',
  ERROR_TAGS: 'ERROR_TAGS',
  ERROR_403: 'ERROR_403',
}
