import { IUserConfig, IUserInfo, UserPermission, UserPermissionType } from '../types'
import { GAGU_USER_CONFIG_KEY, GAGU_USER_INFO_KEY } from './constant.util'

export const UserInfoStore = {
  get() {
    const userInfoValue = localStorage.getItem(GAGU_USER_INFO_KEY) || ''
    if (userInfoValue) {
      const storeUserInfo = JSON.parse(userInfoValue)
      const userInfo: IUserInfo = {
        token: storeUserInfo.token || '',
        nickname: storeUserInfo.nickname || 'NO_NICKNAME',
        username: storeUserInfo.username || 'UNKNOWN',
        expiredAt: storeUserInfo.expiredAt,
        permissions: storeUserInfo.permissions || [],
      }
      return userInfo
    } else {
      return null
    }
  },

  getToken() {
    return this.get()?.token || ''
  },

  getUsername() {
    return this.get()?.username || ''
  },

  set(userInfo: IUserInfo) {
    localStorage.setItem(GAGU_USER_INFO_KEY, JSON.stringify(userInfo))
  },

  remove() {
    localStorage.removeItem(GAGU_USER_INFO_KEY)
  },
}

export const UserConfigStore = {
  get() {
    const userConfig: IUserConfig = {
      fileExplorerAutoOpen: false,
      fileExplorerDefaultPath: '',
    }
    const userConfigValue = localStorage.getItem(GAGU_USER_CONFIG_KEY) || ''
    if (userConfigValue) {
      const config = JSON.parse(userConfigValue)
      Object.assign(userConfig, config)
    }
    return userConfig
  },

  set(userConfig: IUserConfig) {
    localStorage.setItem(GAGU_USER_CONFIG_KEY, JSON.stringify(userConfig))
  },

  remove() {
    localStorage.removeItem(GAGU_USER_CONFIG_KEY)
  },
}

const sortMap = {
  [UserPermission.administer]: 0,
  [UserPermission.read]: 1,
  [UserPermission.write]: 2,
  [UserPermission.delete]: 3,
}

export const permissionSorter = (prev: UserPermissionType, next: UserPermissionType) => {
  return sortMap[prev] > sortMap[next] ? 1 : -1
}
