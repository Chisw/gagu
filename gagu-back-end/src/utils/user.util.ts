import { readFileSync, writeFileSync } from 'fs'
import { IAuthRecord, IUser, IUserInfo, User } from '../types'
import {
  GAGU_PATH,
  HEADERS_AUTH_KEY,
  HEADERS_AUTH_PREFIX,
  ACCESS_TOKEN_KEY,
} from './constant.util'
import { Request } from 'express'
import { JSONFormat, completeNestedPath } from './fs.util'

export const getAuthorizationToken = (authorization: string) => {
  return (authorization || '').replace(HEADERS_AUTH_PREFIX, '')
}

export const getRequestTokens = (request: Request) => {
  const authorization = request.header(HEADERS_AUTH_KEY) || ''
  const token = getAuthorizationToken(authorization)
  const accessToken = (request.query[ACCESS_TOKEN_KEY] || '') as string
  return [token, accessToken]
}

export const writeUsersData = (userList: IUser[]) => {
  writeFileSync(GAGU_PATH.DATA_USERS, JSONFormat(userList))
}

export const readUsersData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_USERS).toString('utf-8')
  const userList: IUser[] = JSON.parse(dataStr)
  return userList
}

export const writeAuthData = (authRecordList: IAuthRecord[]) => {
  writeFileSync(GAGU_PATH.DATA_AUTH, JSONFormat(authRecordList))
}

export const readAuthData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_AUTH).toString('utf-8')
  const authRecordList: IAuthRecord[] = JSON.parse(dataStr)
  return authRecordList
}

export const generateUserInfo = (
  user: IUser,
  token: User.Token,
  accessToken: User.AccessToken,
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

export const initUserPaths = (username: User.Username) => {
  completeNestedPath(`${GAGU_PATH.USERS}/${username}/desktop/_`)
}
