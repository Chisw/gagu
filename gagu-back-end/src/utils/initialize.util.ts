import { IUser, UserStatus } from 'src/types'
import { GAGU_PATH } from './constant.util'
import { writeLoginData, writeUsersData } from './user.util'
import { completeNestedPath, getExists } from './fs.util'
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
      nickname: 'Admin',
      username: 'gagu',
      password: md5('9293'),
      status: UserStatus.normal,
      expiredAt: 0,
      permissionList: [],
      rootEntryPathList: [],
      isAdmin: true,
      createdAt: Date.now(),
    }
    writeUsersData([adminUser])
  }

  if (!getExists(GAGU_PATH.LOGIN_DATA)) {
    writeLoginData({})
  }
}
