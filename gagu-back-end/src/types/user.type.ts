export interface IUser {
  isAdmin: boolean
  username: string
  password: string
  rootEntryList: string[]
  permissionList: string[]
  validUntil: number
}

export interface IUserListData {
  version: string
  userList: IUser[]
}
