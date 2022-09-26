import { exec, spawn } from 'child_process'
import { accessSync, constants, mkdirSync, writeFileSync } from 'fs'
import {
  GAGU_CONFIG_PATH,
  GAGU_VERSION,
  OS,
  USER_LIST_DATA_PATH,
} from './constant.util'
import * as md5 from 'md5'
import { IUser, IUserListData } from 'src/types'

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

export const writeUserListData = (userList: IUser[]) => {
  const userListData: IUserListData = {
    version: GAGU_VERSION,
    userList,
  }
  writeFileSync(USER_LIST_DATA_PATH, JSON.stringify(userListData))
}

export const initConfig = () => {
  completeNestedPath(`${GAGU_CONFIG_PATH}/thumbnail/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/data/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/log/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/desktop/PLACEHOLDER`)
  completeNestedPath(`${GAGU_CONFIG_PATH}/public/PLACEHOLDER`)
  if (!getExists(USER_LIST_DATA_PATH)) {
    const adminUser: IUser = {
      isAdmin: true,
      username: 'gagu',
      password: md5('9293'),
      rootEntryList: [],
      permissionList: [],
      validUntil: 0,
    }
    writeUserListData([adminUser])
  }
}
