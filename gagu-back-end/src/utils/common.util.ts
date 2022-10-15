import { exec, spawn } from 'child_process'
import { OS } from './constant.util'
import * as md5 from 'md5'

export const genHashId = () => md5(Math.random().toString())

export const openInBrowser = (url: string) => {
  if (OS.isMacOS) {
    exec(`open ${url}`)
  } else if (OS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

// Sync following code to BE & FE
export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
