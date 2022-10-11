// Sync following code to BE & FE
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  type Token = string
  type Nickname = string
  type Username = string
  type Password = string
}

export type UserAbilityType = 'enable' | 'disable'
export type UserExpiredAtType = number | undefined

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
  expiredAt: UserExpiredAtType
  permissionList: UserPermissionType[]
  rootEntryPathList: string[]
}

export interface IUserForm extends IUser {
  avatar: string
  password2: string
}

export class UserForm implements IUserForm {
  avatar = ''
  nickname: User.Nickname = ''
  username: User.Username = ''
  password: User.Password = ''
  password2: User.Password = ''
  disabled = false
  createdAt = 0
  expiredAt: UserExpiredAtType = undefined
  permissionList: UserPermissionType[] = [UserPermission.read]
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

export interface ILoginRecord {
  token: User.Token
  username: User.Username
  timestamp: number
}

export interface IUserInfo {
  token: User.Token
  nickname: User.Nickname
  username: User.Username
  disabled: boolean
  expiredAt: UserExpiredAtType
  permissionList: UserPermissionType[]
}
