import { readFileSync, writeFileSync } from 'fs'
import { IDownloadTunnel } from '../types'
import { GAGU_PATH, SERVER_MESSAGE_MAP } from './constant.util'

export const writeDownloadTunnelData = (
  downloadTunnelList: IDownloadTunnel[],
) => {
  writeFileSync(GAGU_PATH.DATA_DOWNLOADS, JSON.stringify(downloadTunnelList))
}

export const readDownloadTunnelData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_DOWNLOADS).toString('utf-8')
  const downloadTunnelList: IDownloadTunnel[] = JSON.parse(dataStr)
  return downloadTunnelList
}

export const checkTunnel = (
  tunnel: IDownloadTunnel | undefined,
  inputtedPassword?: string,
) => {
  if (tunnel) {
    const { leftTimes, expiredAt, password } = tunnel

    if (leftTimes === 0) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NO_LEFT,
      }
    } else if (expiredAt && expiredAt < Date.now()) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_EXPIRED,
      }
    } else if (password && inputtedPassword !== password) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_WRONG,
      }
    } else {
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    }
  } else {
    return {
      success: false,
      message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NOT_EXISTED,
    }
  }
}
