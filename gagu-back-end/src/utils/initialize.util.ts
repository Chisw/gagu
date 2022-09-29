import { IUser, UserStatus } from 'src/types'
import { completeNestedPath, getExists } from './common.util'
import { GAGU_PATH } from './constant.util'
import { writeLoginData, writeUsersData } from './user.util'
import * as md5 from 'md5'

export const initialize = () => {
  completeNestedPath(`${GAGU_PATH.ROOT}/data/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/desktop/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/log/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/avatar/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/lib/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/thumbnail/PLACEHOLDER`)

  if (!getExists(GAGU_PATH.USERS_DATA)) {
    const adminUser: IUser = {
      isAdmin: true,
      username: 'gagu',
      password: md5('9293'),
      rootEntryPathList: [],
      permissionList: [],
      createdAt: Date.now(),
      expiredAt: 0,
      status: UserStatus.normal,
    }
    writeUsersData([adminUser])
  }

  if (!getExists(GAGU_PATH.LOGIN_DATA)) {
    writeLoginData({})
  }
}
