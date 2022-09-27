import { readFileSync, writeFileSync } from 'fs'
import { IUser, IUsersData } from 'src/types'
import { GAGU_VERSION, GAGU_PATH } from './constant.util'

export const writeUsersData = (userList: IUser[]) => {
  const userListData: IUsersData = {
    version: GAGU_VERSION,
    userList,
  }
  writeFileSync(GAGU_PATH.USERS_DATA, JSON.stringify(userListData))
}

export const readUsersData = () => {
  const dataStr = readFileSync(GAGU_PATH.USERS_DATA).toString('utf-8')
  const userListData: IUsersData = JSON.parse(dataStr)
  const { version, userList } = userListData

  if (version < GAGU_VERSION) {
    // TODO: handle user version
  }

  return userList
}
