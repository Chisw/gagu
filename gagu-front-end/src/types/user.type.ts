export interface IUser {
  isAdmin: boolean
  username: string
  password: string
  rootEntryList: string[]
  permissionList: string[]
  createdAt: number
  expiredAt: number
  isForbidden: boolean
}
