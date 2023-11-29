// Sync following code to BE & FE
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  type Token = string
  type Nickname = string
  type Username = string
  type Password = string
}

export type UserValidityType = 'valid' | 'invalid'

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
  invalid: boolean
  createdAt: number
  expiredAt?: number
  permissions: UserPermissionType[]
  assignedRootPathList: string[]
  favoritePathList: string[]
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
  invalid = false
  createdAt = 0
  expiredAt?: number
  permissions: UserPermissionType[] = [UserPermission.read]
  assignedRootPathList: string[] = []
  favoritePathList: string[] = []

  constructor(user?: IUser, avatarPath?: string) {
    if (user) {
      this.avatar = avatarPath || ''
      this.nickname = user.nickname
      this.username = user.username
      this.invalid = user.invalid
      this.expiredAt = user.expiredAt
      this.permissions = user.permissions
      this.assignedRootPathList = user.assignedRootPathList
      this.favoritePathList = user.favoritePathList
    }
  }
}

export interface IAuthRecord {
  token: User.Token
  username: User.Username
  timestamp: number
}

export interface IUserInfo {
  token: User.Token
  nickname: User.Nickname
  username: User.Username
  expiredAt?: number
  permissions: UserPermissionType[]
}
