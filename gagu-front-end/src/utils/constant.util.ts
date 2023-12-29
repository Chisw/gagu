const { protocol, host } = window.location

export const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`

export const GAGU_I18N_LANGUAGE_KEY = 'GAGU_I18N_LANGUAGE_KEY'
export const GAGU_USER_INFO_KEY = 'GAGU_USER_INFO_KEY'
export const GAGU_USER_CONFIG_KEY = 'GAGU_USER_CONFIG_KEY'
export const GAGU_ENTRY_PATH_CACHE_KEY = 'GAGU_ENTRY_PATH_CACHE_KEY'
export const DOCUMENT_TITLE = 'GAGU.IO'
export const INVALID_NAME_CHAR_LIST = ['/', '|', '\\', '?', ':', '<', '>', '*']
export const ERROR_TIMEOUT = 'ERROR_TIMEOUT'
export const SAME_APP_WINDOW_OFFSET = 24
export const WINDOW_OPEN_MIN_MARGIN = 10
export const HOVER_OPEN_TIMER: { value: NodeJS.Timeout | undefined } = { value: undefined }

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
  { type: 'font', matchList: ['ttf', 'otf', 'woff', 'woff2'] },
]

export const WINDOW_DURATION = 200

export const WINDOW_STATUS_MAP = {
  opening: { transition: 'none', transitionDuration: '0', transform: 'perspective(1000px) rotateX(-50deg) scale(.5)', opacity: 0 },
  opened: { transition: 'all', transitionDuration: `${WINDOW_DURATION}ms`, transform: '', opacity: 1 },
  hiding: { transition: 'all', transitionDuration: `${WINDOW_DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
  hidden: { transition: 'all', transitionDuration: `${WINDOW_DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
  showing: { transition: 'all', transitionDuration: '0', transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
  shown: { transition: 'all', transitionDuration: `${WINDOW_DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(0)', opacity: 1 },
  closing: { transition: 'all', transitionDuration: `${WINDOW_DURATION}ms`, transform: 'perspective(1000px) rotateX(-50deg) scale(.5)', opacity: 0 },
  closed: undefined,
}

// Sync following code to BE & FE
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
