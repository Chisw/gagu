import { exec, spawn } from 'child_process'
import { OS } from './constant.util'

export const openInBrowser = (url: string) => {
  if (OS.isMacOS) {
    exec(`open ${url}`)
  } else if (OS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}
