// Sync following code to BE & FE
export enum ServerMessage {
  OK = 'OK',
  ERROR_NO_RESPONSE = 'ERROR_NO_RESPONSE',
  ERROR_PASSWORD_WRONG = 'ERROR_PASSWORD_WRONG',
  ERROR_PASSWORD_LOCKED = 'ERROR_PASSWORD_LOCKED',
  ERROR_USER_NOT_EXISTED = 'ERROR_USER_NOT_EXISTED',
  ERROR_USER_EXISTED = 'ERROR_USER_EXISTED',
  ERROR_USER_DISABLED = 'ERROR_USER_DISABLED',
  ERROR_USER_EXPIRED = 'ERROR_USER_EXPIRED',
  ERROR_TOKEN_INVALID = 'ERROR_TOKEN_INVALID',
  ERROR_FILE_DELETE_FAIL = 'ERROR_FILE_DELETE_FAIL',
  ERROR_FILE_NOT_EXISTED = 'ERROR_FILE_NOT_EXISTED',
  ERROR_TUNNEL_NOT_EXISTED = 'ERROR_TUNNEL_NOT_EXISTED',
  ERROR_TUNNEL_NO_LEFT = 'ERROR_TUNNEL_NO_LEFT',
  ERROR_TUNNEL_EXPIRED = 'ERROR_TUNNEL_EXPIRED',
  ERROR_TUNNEL_PASSWORD_WRONG = 'ERROR_TUNNEL_PASSWORD_WRONG',
  ERROR_TUNNEL_PASSWORD_NEEDED = 'ERROR_TUNNEL_PASSWORD_NEEDED',
  ERROR_EXIF = 'ERROR_EXIF',
  ERROR_TAGS = 'ERROR_TAGS',
  ERROR_NOT_SUPPORT_THUMBNAIL = 'ERROR_NOT_SUPPORT_THUMBNAIL',
  ERROR_403 = 'ERROR_403',
  ERROR_403_USER_NOT_MATCHED = 'ERROR_403_USER_NOT_MATCHED',
  ERROR_403_PERMISSION_DELETE = 'ERROR_403_PERMISSION_DELETE',
}

export interface IServerOS {
  username: string
  host: string
  hostname: string
  platform: NodeJS.Platform | ''
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
  isAndroid: boolean
  supportThumbnail: boolean
  supportCompression: boolean
  supportCurl: boolean
}

export interface IVersion {
  name: string
  author: string
  date: string
  version: string
}

export interface IExif {
  '0th': object
  '1st': object
  Exif: object
  GPS: object
  Interop: object
}

export interface IAudioTag {
  title: string
  artist: string
  album: string
  track: string
  base64: string
  recordingTime: string
  releaseTime: string
}
