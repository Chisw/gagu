export enum HotkeyStyle {
  mac = 'mac',
  win = 'win',
}

export interface IUserConfig {
  hotkeyStyle: keyof typeof HotkeyStyle
  kiloSize: 1000 | 1024
  fileExplorerAutoOpen: boolean
  fileExplorerDefaultPath: string
}

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
  assignedRootPathList?: string[]
  favoritePathList?: string[]
  passwordLocked?: boolean
}

export interface IUserForm extends Omit<IUser, 'favoritePathList'> {
  avatar: string
  password2: string
  assignedRootPathList: string[]
  passwordLocked: boolean
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
  passwordLocked = false

  constructor(user?: IUser, avatarPath?: string) {
    if (user) {
      this.avatar = avatarPath || ''
      this.nickname = user.nickname
      this.username = user.username
      this.invalid = user.invalid
      this.expiredAt = user.expiredAt
      this.permissions = user.permissions
      this.assignedRootPathList = user.assignedRootPathList || []
      this.passwordLocked = user.passwordLocked || false
    }
  }
}

export class UserPasswordForm {
  password: User.Password = ''
  newPassword: User.Password = ''
  newPassword2: User.Password = ''
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
  passwordLocked?: boolean
  permissions: UserPermissionType[]
}
