export namespace User {
  export type Token = string
  export type Username = string
  export type Password = string
}

export interface IUser {
  isAdmin: boolean
  username: User.Username
  password: User.Password
  rootEntryList: string[]
  permissionList: string[]
  expiredAt: number
}

export interface IUserListData {
  version: string
  userList: IUser[]
}
