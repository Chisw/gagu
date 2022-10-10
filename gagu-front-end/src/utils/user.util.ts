import { IUser, IUserForm } from '../types'

export const GAGU_AUTH_TOKEN_KEY = 'GAGU_AUTH_TOKEN_KEY'

export const TOKEN = {
  get() {
    const token = localStorage.getItem(GAGU_AUTH_TOKEN_KEY) || ''
    return token
  },

  set(token: string) {
    localStorage.setItem(GAGU_AUTH_TOKEN_KEY, token)
  },

  remove() {
    localStorage.removeItem(GAGU_AUTH_TOKEN_KEY)
  },
}

export const getIsExpired = (userData: IUser | IUserForm) => {
  const { expiredAt } = userData
  return expiredAt && expiredAt < Date.now()
}
