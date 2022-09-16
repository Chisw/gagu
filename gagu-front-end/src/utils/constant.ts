const { protocol, host } = window.location
export const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`

export const GAGU_AUTH_KEY = 'GAGU_AUTHORIZATION_KEY'
export const DOCUMENT_TITLE = 'GAGU'
export const INVALID_NAME_CHAR_LIST = ['/', '|', '\\', '?', ':', '"', '<', '>', '*']
export const MAX_PAGE_SIZE = 200

// sync back and front
export const GEN_THUMBNAIL_VIDEO_LIST = ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb']
export const GEN_THUMBNAIL_IMAGE_LIST = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'pbm', 'svg']
export const GEN_THUMBNAIL_LIST = [
  ...GEN_THUMBNAIL_VIDEO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]

export const ENTRY_ICON_LIST = [
  { type: 'folder', matchList: ['_dir'] },
  { type: 'folder-empty', matchList: ['_dir_new', '_dir_empty'] },
  { type: 'application', matchList: ['apk'] },
  { type: 'archive', matchList: ['zip', 'rar', '7z'] },
  { type: 'audio', matchList: ['mp3', 'flac', 'wav', 'aac'] },
  { type: 'code', matchList: ['html', 'css', 'js', 'php', 'ts', 'tsx'] },
  { type: 'data', matchList: ['dat', 'db', 'sql', 'json', 'log'] },
  { type: 'document', matchList: ['_txt_new', 'txt', 'md'] },
  { type: 'image', matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico', 'pbm'] },
  { type: 'pdf', matchList: ['pdf'] },
  { type: 'video', matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb'] },
]
