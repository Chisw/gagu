import { exec, spawn } from 'node:child_process'
import { ServerOS } from './constant.util'
import { ServerMessage } from '../types'
import { createHash } from 'node:crypto'
import * as chalk from 'chalk'

export const sha256 = (str: string) => {
  return createHash('sha256').update(str, 'utf8').digest('hex')
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
  const response = {
    success: !errorMessage,
    message: successMessage || errorMessage || ServerMessage.OK,
    data: data === null ? undefined : data,
  }
  return response
}

export const catchError = (error: any) => {
  console.log(chalk.red('[GAGU-ERROR-CATCHER]'), error)
}

export const generateRandomToken = () => {
  return Buffer.from(generateRandomCode()).toString('base64')
}

// Sync following code to BE & FE
export const generateRandomCode = () => sha256(Math.random().toString())

export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
