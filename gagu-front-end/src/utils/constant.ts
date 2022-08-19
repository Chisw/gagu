const { protocol, host } = window.location
export const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`

export const GAGU_CURRENT_VERSION = 'v0.0.14'
export const GAGU_AUTH_KEY = 'GAGU_AUTH_KEY'
export const DOCUMENT_TITLE = 'GAGU'
export const INVALID_NAME_CHAR_LIST = ['/', '|', '\\', '?', ':', '"', '<', '>', '*']

// sync back and front
export const GEN_THUMBNAIL_VIDEO_LIST = ['mp4', 'mkv', 'avi', 'rm', 'rmvb']
export const GEN_THUMBNAIL_IMAGE_LIST = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pbm', 'bmp']
export const GEN_THUMBNAIL_LIST = [
  ...GEN_THUMBNAIL_VIDEO_LIST,
  ...GEN_THUMBNAIL_IMAGE_LIST,
]
