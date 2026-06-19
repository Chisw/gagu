import { exec, spawn } from 'node:child_process'
import { ServerOS } from './constant.util'
import {
  IResponse,
  ServerMessage,
  HEADERS_AUTH_KEY,
  HEADERS_AUTH_PREFIX,
  ACCESS_TOKEN_KEY,
} from '@shared'
import { createHash } from 'node:crypto'
import * as chalk from 'chalk'
import { Request } from 'express'

export const sha256 = (str: string) => {
  return createHash('sha256').update(str, 'utf8').digest('hex')
}

export const generateRandomCode = () => sha256(Math.random().toString())

export const generateRandomToken = () => {
  return Buffer.from(generateRandomCode()).toString('base64')
}

export const getAuthorizationToken = (authorization: string) => {
  return (authorization || '').replace(HEADERS_AUTH_PREFIX, '')
}

export const getRequestTokens = (request: Request) => {
  const authorization = request.header(HEADERS_AUTH_KEY) || ''
  const token = getAuthorizationToken(authorization)
  const accessToken = (request.query[ACCESS_TOKEN_KEY] || '') as string
  return [token, accessToken]
}

export const openInBrowser = (url: string) => {
  if (ServerOS.isMacOS) {
    exec(`open ${url}`)
  } else if (ServerOS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

export const respond = <T>(
  data?: T,
  errorMessage?: keyof typeof ServerMessage,
  successMessage?: keyof typeof ServerMessage,
) => {
  const response: IResponse<T | undefined> = {
    success: !errorMessage,
    message: successMessage || errorMessage || ServerMessage.OK,
    data: data === null ? undefined : data,
  }
  return response
}

export const catchError = (error: any) => {
  console.log(chalk.red('[GAGU-ERROR-CATCHER]'), error)
}
