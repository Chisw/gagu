import { readFileSync, writeFileSync } from 'fs'
import { IAuthRecord, IUser, IUserInfo, User } from 'src/types'
import { GAGU_PATH, HEADERS_AUTH_KEY } from './constant.util'
import { Request } from 'express'

export const getReqToken = (req: Request) => {
  const authorization = req.header(HEADERS_AUTH_KEY) || ''
  const queryToken = (req.query.token || '') as string
  const token = authorization || queryToken
  return token
}

export const writeUsersData = (userList: IUser[]) => {
  writeFileSync(GAGU_PATH.DATA_USERS, JSON.stringify(userList))
}

export const readUsersData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_USERS).toString('utf-8')
  const userList: IUser[] = JSON.parse(dataStr)
  return userList
}

export const writeAuthData = (authRecordList: IAuthRecord[]) => {
  writeFileSync(GAGU_PATH.DATA_AUTH, JSON.stringify(authRecordList))
}

export const readAuthData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_AUTH).toString('utf-8')
  const authRecordList: IAuthRecord[] = JSON.parse(dataStr)
  return authRecordList
}

export const genUserInfo = (user: IUser, token: User.Token) => {
  const { nickname, username, disabled, expiredAt, permissionList } = user
  const userInfo: IUserInfo = {
    token,
    nickname,
    username,
    disabled,
    expiredAt,
    permissionList,
  }
  return userInfo
}
