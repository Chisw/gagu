import { readFileSync, writeFileSync } from 'fs'
import { ITunnel, ServerMessage } from '../types'
import { GAGU_PATH } from './constant.util'
import { JSONFormat } from './fs.util'
import { respond } from './common.util'

export const writeTunnelData = (tunnelList: ITunnel[]) => {
  writeFileSync(GAGU_PATH.DATA_TUNNELS, JSONFormat(tunnelList))
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
      return respond(null, ServerMessage.ERROR_TUNNEL_NO_LEFT)
    } else if (expiredAt && expiredAt < Date.now()) {
      return respond(null, ServerMessage.ERROR_TUNNEL_EXPIRED)
    } else if (password && inputtedPassword !== password) {
      return respond(null, ServerMessage.ERROR_TUNNEL_PASSWORD_WRONG)
    } else {
      return respond()
    }
  } else {
    return respond(null, ServerMessage.ERROR_TUNNEL_NOT_EXISTED)
  }
}
