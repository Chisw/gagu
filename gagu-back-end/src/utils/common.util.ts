import { exec, spawn } from 'child_process'
import { ServerOS } from './constant.util'
import * as md5 from 'md5'

export const genHashCode = () => md5(Math.random().toString())

export const openInBrowser = (url: string) => {
  if (ServerOS.isMacOS) {
    exec(`open ${url}`)
  } else if (ServerOS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

// Sync following code to BE & FE
export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
