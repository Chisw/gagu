// Sync BE & FE
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  type Token = string
  type Nickname = string
  type Username = string
  type Password = string
}

export enum UserPermission {
  administer = 'administer',
  read = 'read',
  write = 'write',
  delete = 'delete',
}

export type UserPermissionType = keyof typeof UserPermission

export interface IUser {
  nickname: User.Nickname
  username: User.Username
  password: User.Password
  disabled: boolean
  createdAt: number
  expiredAt: number
  permissionList: UserPermissionType[]
  rootEntryPathList: string[]
}

export interface IUserForm extends IUser {
  avatar: string
}

export class UserForm implements IUserForm {
  avatar = ''
  nickname: User.Nickname = ''
  username: User.Username = ''
  password: User.Password = ''
  disabled = false
  createdAt = 0
  expiredAt = 0
  permissionList: UserPermissionType[] = []
  rootEntryPathList: string[] = []

  constructor(user?: IUser, avatarPath?: string) {
    if (user) {
      this.avatar = avatarPath || ''
      this.nickname = user.nickname
      this.username = user.username
      this.disabled = user.disabled
      this.expiredAt = user.expiredAt
      this.permissionList = user.permissionList
      this.rootEntryPathList = user.rootEntryPathList
    }
  }
}

export interface IUsersData {
  version: string
  userList: IUser[]
}

export type ILoginMap = { [TOKEN: User.Token]: User.Username }
