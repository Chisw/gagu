import { exec, spawn } from 'child_process'
import { accessSync, constants, mkdirSync } from 'fs'
import { GAGU_PATH, OS } from './constant.util'
import * as md5 from 'md5'
import { IUser } from 'src/types'
import { writeUsersData } from './user.util'

export const genToken = () => md5(Math.random().toString())

export const openInBrowser = (url: string) => {
  if (OS.isMacOS) {
    exec(`open ${url}`)
  } else if (OS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

export const getExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return ''
  return name.split('.').reverse()[0].toLowerCase()
}

export const getExists = (path: string) => {
  let exists = false
  try {
    accessSync(path, constants.F_OK)
    exists = true
  } catch (err) {
    exists = false
  }
  return exists
}

export const completeNestedPath = (path: string) => {
  const list = path.split('/').filter(Boolean).slice(0, -1)
  const nestedPathList = list.map((dirName, index) => {
    const prefix =
      index === 0 ? '' : '/' + list.filter((d, i) => i < index).join('/')
    return `${prefix}/${dirName}`
  })
  nestedPathList.forEach((path) => {
    const p = OS.isWindows ? path.replace('/', '') : path
    const exists = getExists(p)
    !exists && mkdirSync(p)
  })
}

export const initConfig = () => {
  completeNestedPath(`${GAGU_PATH.ROOT}/thumbnail/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/data/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/log/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/desktop/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/avatar/PLACEHOLDER`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/lib/PLACEHOLDER`)
  if (!getExists(GAGU_PATH.USERS_DATA)) {
    const adminUser: IUser = {
      isAdmin: true,
      username: 'gagu',
      password: md5('9293'),
      rootEntryList: [],
      permissionList: [],
      createdAt: Date.now(),
      expiredAt: 0,
      isForbidden: false,
    }
    writeUsersData([adminUser])
  }
}
