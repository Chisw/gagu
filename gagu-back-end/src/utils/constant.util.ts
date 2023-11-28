import * as chalk from 'chalk'
import * as os from 'os'
import { IServerOS } from 'src/types'

const platform = os.platform()
const hostname = os.hostname()

export const GAGU_VERSION = '0.0.48'
export const IS_DEV = process.env.NODE_ENV === 'development'

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
  ipList.sort((ip) => (ip.indexOf('192') >= 0 ? -1 : 1))
  return ipList[0] || '127.0.0.1'
})()

export const ServerOS: IServerOS = {
  username: process.env.USER || os.userInfo().username,
  host: HOST,
  hostname,
  platform,
  isMacOS: platform === 'darwin',
  isWindows: platform === 'win32',
  isLinux: platform === 'linux',
  isAndroid: platform === 'android',
  supportCompression: false,
  supportCurl: false,
  supportThumbnail: false,
}

export const PATH_MAP: { [PLATFORM: string]: string } = {
  darwin: `/Users/${ServerOS.username}/.io.gagu`,
  win32: `C:/Users/${ServerOS.username}/.io.gagu`,
  android: `/data/data/com.termux/files/home/.io.gagu`,
}

export const ROOT_PATH =
  (PATH_MAP[ServerOS.platform] || '') + (IS_DEV ? '.dev' : '')

// TODO: use path check
export const FORBIDDEN_ENTRY_NAME_LIST = ['.io.gagu', '.io.gagu.dev']

export const GAGU_PATH = {
  ROOT: ROOT_PATH,
  DATA: `${ROOT_PATH}/data`,
  DATA_USERS: `${ROOT_PATH}/data/users.json`,
  DATA_AUTH: `${ROOT_PATH}/data/auth.json`,
  DATA_TUNNELS: `${ROOT_PATH}/data/tunnels.json`,
  DATA_SETTINGS: `${ROOT_PATH}/data/settings.json`,
  LOG: `${ROOT_PATH}/log`,
  PUBLIC_AVATAR: `${ROOT_PATH}/public/avatar`,
  PUBLIC_IMAGE: `${ROOT_PATH}/public/image`,
}

export const HELP_INFO = `
  Usage:

    gagu              ${chalk.gray('# Start service')}
    gagu -o           ${chalk.gray('# Start and open in browser, or --open')}
    gagu -H 0.0.0.0   ${chalk.gray('# Start with a customized host, or --Host')}
    gagu -p 80        ${chalk.gray('# Start with a customized port, or --port')}
    gagu -h           ${chalk.gray('# Show help info, or --help')}
    gagu -v           ${chalk.gray('# Show version, or --version')}
    gagu --reset      ${chalk.gray('# Remove GAGU data directory')}
    gagu --reset-all  ${chalk.gray('# Remove GAGU root directory')}
`

export const LOGO_TEXT = `
     _______ _______ _______ ____ __ 
    |     __|    _  |     __|    |  |
    |    |  |       |    |  |    |  |
    |_______|____|__|_______|_______|
`

// Sync following code to BE & FE
export const PULSE_INTERVAL = 60 * 1000
export const HEADERS_AUTH_KEY = 'Authorization'
export const HEADERS_AUTH_PREFIX = 'Bearer '
export const QUERY_TOKEN_KEY = 'access_token'

export const GEN_THUMBNAIL_VIDEO_LIST = [
  'mp4',
  'mkv',
  'avi',
  'rm',
  'rmvb',
  'webm',
]

export const GEN_THUMBNAIL_AUDIO_LIST = ['mp3']

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
  ...GEN_THUMBNAIL_AUDIO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]

export const SERVER_MESSAGE_MAP = {
  OK: 'OK',
  ERROR_NO_RESPONSE: 'ERROR_NO_RESPONSE',
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
