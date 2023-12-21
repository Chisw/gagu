import { HotkeyStyle, IEntryPathCache } from './../types/index';
import { IUserConfig, IUserInfo } from '../types'
import { GAGU_ENTRY_PATH_CACHE_KEY, GAGU_USER_CONFIG_KEY, GAGU_USER_INFO_KEY } from './constant.util'

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
      hotkeyStyle: HotkeyStyle.mac,
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

export const EntryPathCacheStore = {
  get() {
    return JSON.parse(localStorage.getItem(GAGU_ENTRY_PATH_CACHE_KEY) || '{}') as IEntryPathCache
  },

  set(cache: IEntryPathCache) {
    localStorage.setItem(GAGU_ENTRY_PATH_CACHE_KEY, JSON.stringify(cache))
  },

  remove() {
    localStorage.removeItem(GAGU_ENTRY_PATH_CACHE_KEY)
  },
}
