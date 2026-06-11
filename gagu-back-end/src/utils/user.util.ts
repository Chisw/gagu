import { IAuthRecord, IUser, IUserInfo, User } from '../types'
import {
  GAGU_PATH,
  HEADERS_AUTH_KEY,
  HEADERS_AUTH_PREFIX,
  ACCESS_TOKEN_KEY,
} from './constant.util'
import { Request } from 'express'
import { makeNestedDirectory, readJSONData, writeJSONData } from './fs.util'

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
  writeJSONData(GAGU_PATH.DATA_USERS, userList)
}

export const readUsersData = () => {
  const userList = readJSONData<IUser[]>(GAGU_PATH.DATA_USERS)
  return userList
}

export const writeAuthData = (authRecordList: IAuthRecord[]) => {
  writeJSONData(GAGU_PATH.DATA_AUTH, authRecordList)
}

export const readAuthData = () => {
  const authRecordList = readJSONData<IAuthRecord[]>(GAGU_PATH.DATA_AUTH)
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
  makeNestedDirectory(`${GAGU_PATH.USERS}/${username}/desktop`)
}
