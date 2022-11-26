import { readFileSync, writeFileSync } from 'fs'
import { ITunnel } from '../types'
import { GAGU_PATH, SERVER_MESSAGE_MAP } from './constant.util'

export const writeTunnelData = (tunnelList: ITunnel[]) => {
  writeFileSync(GAGU_PATH.DATA_TUNNELS, JSON.stringify(tunnelList))
}

export const readTunnelData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_TUNNELS).toString('utf-8')
  const tunnelList: ITunnel[] = JSON.parse(dataStr)
  return tunnelList
}

export const checkTunnel = (
  tunnel: ITunnel | undefined,
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
