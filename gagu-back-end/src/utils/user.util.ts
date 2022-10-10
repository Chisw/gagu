import { readFileSync, writeFileSync } from 'fs'
import { ILoginRecord, IUser, IUserForm } from 'src/types'
import { GAGU_PATH } from './constant.util'

export const writeUsersData = (userList: IUser[]) => {
  writeFileSync(GAGU_PATH.USERS_DATA, JSON.stringify(userList))
}

export const readUsersData = () => {
  const dataStr = readFileSync(GAGU_PATH.USERS_DATA).toString('utf-8')
  const userList: IUser[] = JSON.parse(dataStr)
  return userList
}

export const writeLoginData = (loginRecordList: ILoginRecord[]) => {
  writeFileSync(GAGU_PATH.LOGIN_DATA, JSON.stringify(loginRecordList))
}

export const readLoginData = () => {
  const dataStr = readFileSync(GAGU_PATH.LOGIN_DATA).toString('utf-8')
  const loginRecordList: ILoginRecord[] = JSON.parse(dataStr)
  return loginRecordList
}

export const getIsExpired = (userData: IUser | IUserForm) => {
  const { expiredAt } = userData
  return expiredAt && expiredAt < Date.now()
}
