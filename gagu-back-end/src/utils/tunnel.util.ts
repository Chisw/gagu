import { ServerMessage, ITunnel } from '@shared'
import { GAGU_PATH } from './constant.util'
import { readJSONData, writeJSONData } from './fs.util'
import { respond } from './common.util'

export const writeTunnelData = (tunnelList: ITunnel[]) => {
  writeJSONData(GAGU_PATH.DATA_TUNNELS, tunnelList)
}

export const readTunnelData = () => {
  const tunnelList = readJSONData<ITunnel[]>(GAGU_PATH.DATA_TUNNELS)
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
