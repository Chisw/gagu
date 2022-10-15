import { IUserInfo, UserPermission, UserPermissionType } from '../types'

export const GAGU_USER_INFO_KEY = 'GAGU_USER_INFO_KEY'

export const USER_INFO = {
  get() {
    const userInfoStr = localStorage.getItem(GAGU_USER_INFO_KEY) || ''
    if (userInfoStr) {
      const storeUserInfo = JSON.parse(userInfoStr)
      const userInfo: IUserInfo = {
        token: storeUserInfo.token || '',
        nickname: storeUserInfo.nickname || 'NO_NICKNAME',
        username: storeUserInfo.username || 'UNKNOWN',
        disabled: storeUserInfo.disabled || false,
        expiredAt: storeUserInfo.expiredAt,
        permissionList: storeUserInfo.permissionList || [],
      }
      return userInfo
    } else {
      return null
    }
  },

  getToken() {
    return this.get()?.token || ''
  },

  set(userInfo: IUserInfo) {
    localStorage.setItem(GAGU_USER_INFO_KEY, JSON.stringify(userInfo))
  },

  remove() {
    localStorage.removeItem(GAGU_USER_INFO_KEY)
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
