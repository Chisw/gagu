import { ThumbnailType, ThumbnailTypeType } from '../types'

export const GAGU_VERSION = '0.0.59'

export const ACCESS_TOKEN_KEY = 'accessToken'
export const HEADERS_AUTH_KEY = 'Authorization'
export const HEADERS_AUTH_PREFIX = 'Bearer '

export const GEN_THUMBNAIL_MAP: Record<string, ThumbnailTypeType> = {
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
  m4a: ThumbnailType.audio,
  mp4: ThumbnailType.video,
  mkv: ThumbnailType.video,
  avi: ThumbnailType.video,
  rm: ThumbnailType.video,
  rmvb: ThumbnailType.video,
  webm: ThumbnailType.video,
}

export const GEN_THUMBNAIL_LIST = Object.keys(GEN_THUMBNAIL_MAP)
