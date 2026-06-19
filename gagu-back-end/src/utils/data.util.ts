import {
  IAuthRecord,
  ISetting,
  ITunnel,
  IUser,
  IUserInfo,
  ServerMessage,
} from '@shared'
import { JSONFile } from './fs.util'
import { GAGU_PATH } from './constant.util'
import { respond } from './common.util'

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

export const generateUserInfo = (
  user: IUser,
  token: string,
  accessToken: string,
) => {
  const { nickname, username, expiredAt, passwordLocked, permissions } = user
  const userPath = `${GAGU_PATH.USERS}/${username}`

  const userInfo: IUserInfo = {
    token,
    accessToken,
    nickname,
    username,
    expiredAt,
    passwordLocked,
    permissions,
    userPath,
  }
  return userInfo
}

export const DataManager = {
  auth: {
    read() {
      return JSONFile.read<IAuthRecord[]>(GAGU_PATH.DATA_AUTH)
    },
    write(authRecordList: IAuthRecord[]) {
      JSONFile.write(GAGU_PATH.DATA_AUTH, authRecordList)
    },
  },

  settings: {
    read() {
      return JSONFile.read<ISetting>(GAGU_PATH.DATA_SETTINGS)
    },
    write(settings: ISetting) {
      JSONFile.write(GAGU_PATH.DATA_SETTINGS, settings)
    },
  },

  tunnels: {
    read() {
      return JSONFile.read<ITunnel[]>(GAGU_PATH.DATA_TUNNELS)
    },
    write(tunnelList: ITunnel[]) {
      JSONFile.write(GAGU_PATH.DATA_TUNNELS, tunnelList)
    },
  },

  users: {
    read() {
      return JSONFile.read<IUser[]>(GAGU_PATH.DATA_USERS)
    },
    write(userList: IUser[]) {
      JSONFile.write(GAGU_PATH.DATA_USERS, userList)
    },
  },
}
