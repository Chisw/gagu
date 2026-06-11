import { exec, spawn } from 'node:child_process'
import { ServerOS } from './constant.util'
import { ServerMessage } from '../types'
import crypto from 'node:crypto'
import * as chalk from 'chalk'

export const md5 = (text: string) => {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex')
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

// Sync following code to BE & FE
export const generateRandomCode = () => md5(Math.random().toString())

export const generateRandomToken = () => {
  return Buffer.from(generateRandomCode()).toString('base64')
}

export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
