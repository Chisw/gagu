import * as chalk from 'chalk'
import * as os from 'os'
import { IServerOS, ThumbnailType, ThumbnailTypeType } from 'src/types'

const platform = os.platform()
const hostname = os.hostname()

export const GAGU_VERSION = '0.0.57'
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

const PATH_MAP: { [PLATFORM: string]: string } = {
  android: `/data/data/com.termux/files/home/.io.gagu`,
  darwin: `/Users/${ServerOS.username}/.io.gagu`,
  linux: `/home/${ServerOS.username}/.io.gagu`,
  win32: `C:/Users/${ServerOS.username}/.io.gagu`,
}

const ROOT_PATH = `${PATH_MAP[ServerOS.platform] || ''}${IS_DEV ? '.dev' : ''}`

export const MAC_HIDDEN_ENTRIES = [
  '.Trash',
  '.Trashes',
  '.Spotlight-V100',
  '.VolumeIcon.icns',
  '.TemporaryItems',
]

export const GAGU_PATH = {
  ROOT: ROOT_PATH,
  DATA: `${ROOT_PATH}/data`,
  DATA_USERS: `${ROOT_PATH}/data/users.json`,
  DATA_AUTH: `${ROOT_PATH}/data/auth.json`,
  DATA_TUNNELS: `${ROOT_PATH}/data/tunnels.json`,
  DATA_SETTINGS: `${ROOT_PATH}/data/settings.json`,
  LOG: `${ROOT_PATH}/log`,
  PUBLIC: `${ROOT_PATH}/public`,
  PUBLIC_AVATAR: `${ROOT_PATH}/public/avatar`,
  PUBLIC_IMAGE: `${ROOT_PATH}/public/image`,
  PUBLIC_LIB: `${ROOT_PATH}/public/lib`,
  SECRETS: `${ROOT_PATH}/secrets`,
  THUMBNAIL: `${ROOT_PATH}/thumbnail`,
  USERS: `${ROOT_PATH}/users`,
}

export const HELP_INFO = `
  Usage:

    gagu              ${chalk.gray('# Start service')}
    gagu -o           ${chalk.gray('# Start and open in browser, or --open')}
    gagu -s           ${chalk.gray('# Start with HTTPS, or --security')}
    gagu -H 0.0.0.0   ${chalk.gray('# Start with a specified host, or --Host')}
    gagu -p 80        ${chalk.gray('# Start with a specified port, or --port')}
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
export const ACCESS_TOKEN_KEY = 'accessToken'
export const HEADERS_AUTH_KEY = 'Authorization'
export const HEADERS_AUTH_PREFIX = 'Bearer '

export const GEN_THUMBNAIL_MAP: { [EXTENSION: string]: ThumbnailTypeType } = {
  pdf: ThumbnailType.document,
  jpg: ThumbnailType.image,
  jpeg: ThumbnailType.image,
  png: ThumbnailType.image,
  gif: ThumbnailType.image,
  bmp: ThumbnailType.image,
  webp: ThumbnailType.image,
  ico: ThumbnailType.image,
  pbm: ThumbnailType.image,
  svg: ThumbnailType.image,
  mp3: ThumbnailType.audio,
  mp4: ThumbnailType.video,
  mkv: ThumbnailType.video,
  avi: ThumbnailType.video,
  rm: ThumbnailType.video,
  rmvb: ThumbnailType.video,
  webm: ThumbnailType.video,
}

export const GEN_THUMBNAIL_LIST = Object.keys(GEN_THUMBNAIL_MAP)
