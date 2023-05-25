import { readFileSync, writeFileSync } from 'fs'
import { IAuthRecord, IUser, IUserInfo, User } from '../types'
import {
  COOKIE_TOKEN_KEY,
  GAGU_PATH,
  HEADERS_AUTH_KEY,
  HEADERS_AUTH_PREFIX,
  TOKEN_KEY,
} from './constant.util'
import { Request } from 'express'

export const getAuthorizationToken = (authorization: string) => {
  return (authorization || '').replace(HEADERS_AUTH_PREFIX, '')
}

export const getRequestToken = (request: Request) => {
  const authorization = request.header(HEADERS_AUTH_KEY) || ''
  const authorizationToken = getAuthorizationToken(authorization)
  const cookieToken = request.cookies[COOKIE_TOKEN_KEY]
  const queryToken = request.query[TOKEN_KEY]
  const token = authorizationToken || cookieToken || queryToken
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
  const { nickname, username, disabled, expiredAt, permissions } = user
  const userInfo: IUserInfo = {
    token,
    nickname,
    username,
    disabled,
    expiredAt,
    permissions,
  }
  return userInfo
}
