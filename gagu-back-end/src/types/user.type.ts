// eslint-disable-next-line @typescript-eslint/no-namespace
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
  createdAt: number
  expiredAt: number
  isForbidden: boolean
}

export interface IUsersData {
  version: string
  userList: IUser[]
}
