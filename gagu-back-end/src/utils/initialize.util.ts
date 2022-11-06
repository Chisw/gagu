import { IUser, UserPermission } from '../types'
import { GAGU_PATH } from './constant.util'
import { writeAuthData, writeUsersData } from './user.util'
import { completeNestedPath, getExists } from './fs.util'
import { writeDownloadTunnelData } from './download.util'
import { writeSettingsData } from './setting.util'
import * as md5 from 'md5'

export const initialize = () => {
  completeNestedPath(`${GAGU_PATH.ROOT}/data/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/desktop/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/log/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/avatar/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/lib/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/thumbnail/_`)

  if (!getExists(GAGU_PATH.DATA_USERS)) {
    const administrator: IUser = {
      nickname: 'Admin',
      username: 'gagu',
      password: md5('9293'),
      disabled: false,
      createdAt: Date.now(),
      expiredAt: undefined,
      permissions: [
        UserPermission.administer,
        UserPermission.read,
        UserPermission.write,
        UserPermission.delete,
      ],
      rootEntryPathList: [],
    }
    writeUsersData([administrator])
  }

  if (!getExists(GAGU_PATH.DATA_AUTH)) {
    writeAuthData([])
  }

  if (!getExists(GAGU_PATH.DATA_DOWNLOADS)) {
    writeDownloadTunnelData([])
  }

  if (!getExists(GAGU_PATH.DATA_SETTINGS)) {
    writeSettingsData({})
  }
}
