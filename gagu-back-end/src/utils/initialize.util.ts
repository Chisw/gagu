import { IUser, UserPermission } from '../types'
import { DEPENDENCIES_MAP, GAGU_PATH, ServerOS } from './constant.util'
import { writeAuthData, writeUsersData } from './user.util'
import { completeNestedPath, getExists } from './fs.util'
import { writeTunnelData } from './tunnel.util'
import { writeSettingsData } from './setting.util'
import * as md5 from 'md5'
import { exec } from 'child_process'

export const initialize = () => {
  completeNestedPath(`${GAGU_PATH.ROOT}/data/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/desktop/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/log/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/avatar/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/image/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/lib/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/thumbnail/_`)

  if (!getExists(GAGU_PATH.DATA_USERS)) {
    const administrator: IUser = {
      nickname: 'Admin',
      username: 'gagu',
      password: md5('9293'),
      invalid: false,
      createdAt: Date.now(),
      expiredAt: undefined,
      permissions: [
        UserPermission.administer,
        UserPermission.read,
        UserPermission.write,
        UserPermission.delete,
      ],
      assignedPathList: [],
      favoritePathList: [],
    }
    writeUsersData([administrator])
  }

  if (!getExists(GAGU_PATH.DATA_AUTH)) {
    writeAuthData([])
  }

  if (!getExists(GAGU_PATH.DATA_TUNNELS)) {
    writeTunnelData([])
  }

  if (!getExists(GAGU_PATH.DATA_SETTINGS)) {
    writeSettingsData({})
  }

  const cmd = ServerOS.isWindows ? 'where' : 'type'

  Object.keys(DEPENDENCIES_MAP).forEach((key) => {
    exec(`${cmd} ${key}`, (err, out) => {
      if (out && out.includes('not found')) {
        DEPENDENCIES_MAP[key] = false
      }
    })
  })
}
