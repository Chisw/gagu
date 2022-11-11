// Sync following code to BE & FE
export interface ResponseBase {
  success: boolean
  message: string
}

export interface IServerOS {
  username: string
  host: string
  hostname: string
  platform: NodeJS.Platform | ''
  isMacOS: boolean
  isWindows: boolean
  isAndroid: boolean
}
