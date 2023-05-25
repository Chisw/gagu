const { protocol, host } = window.location

export const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`

export const DOCUMENT_TITLE = 'GAGU.IO'
export const INVALID_NAME_CHAR_LIST = ['/', '|', '\\', '?', ':', '"', '<', '>', '*']
export const ERROR_TIMEOUT = 'ERROR_TIMEOUT'
export const DOWNLOAD_PERIOD = 10 * 60 * 1000

export const ENTRY_ICON_LIST = [
  { type: 'folder', matchList: ['_dir'] },
  { type: 'folder-empty', matchList: ['_dir_new', '_dir_empty'] },
  { type: 'application', matchList: ['apk'] },
  { type: 'archive', matchList: ['zip', 'rar', '7z', 'exe', 'arc', 'bz', 'gz', 'jar'] },
  { type: 'audio', matchList: ['mp3', 'flac', 'wav', 'aac', 'ogg'] },
  { type: 'code', matchList: ['htm', 'html', 'css', 'js', 'php', 'ts', 'tsx'] },
  { type: 'data', matchList: ['dat', 'db', 'sql', 'json', 'log'] },
  { type: 'document', matchList: ['_txt_new', 'txt', 'md', 'xml', 'rtf'] },
  { type: 'image', matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico', 'pbm', 'psd'] },
  { type: 'pdf', matchList: ['pdf'] },
  { type: 'video', matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb', 'webm'] },
  { type: 'word', matchList: ['doc', 'dot', 'docx', 'dotx'] },
  { type: 'excel', matchList: ['xls', 'xlt', 'xlsx'] },
  { type: 'ppt', matchList: ['ppt', 'pps', 'pptx'] },
  { type: 'book', matchList: ['mobi', 'epub'] },
]

// Sync following code to BE & FE
export const PULSE_INTERVAL = 60 * 1000
export const HEADERS_AUTH_KEY = 'Authorization'
export const HEADERS_AUTH_PREFIX = 'Bearer '
export const TOKEN_KEY = 'access_token'
export const COOKIE_TOKEN_KEY = 'gagu_access_token'

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
