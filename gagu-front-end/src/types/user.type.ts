import { IWindowInfoMap, PlayModeType } from '.'

export enum HotkeyStyle {
  mac = 'mac',
  win = 'win',
}

export enum ColorScheme {
  auto = 'auto',
  light = 'light',
  dark = 'dark',
}

export interface IUserConfig {
  hotkeyStyle: keyof typeof HotkeyStyle
  kiloSize: 1000 | 1024
  colorScheme: keyof typeof ColorScheme
  fileExplorerAutoOpen: boolean
  fileExplorerDefaultPath: string
  fileExplorerSideCollapse: boolean
  textEditorFontSize: number
  musicPlayerVolume: number
  musicPlayerCoverDisk: boolean
  musicPlayerPlayMode: PlayModeType
  videoPlayerVolume: number
  windowInfoMap: IWindowInfoMap
}

// Sync following code to BE & FE
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  type Token = string
  type AccessToken = string
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
  pulsedAt?: number
  permissions: UserPermissionType[]
  assignedRootPathList?: string[]
  favoritePathList?: string[]
  passwordLocked?: boolean
}

export interface IUserForm
  extends Omit<IUser, 'favoritePathList' | 'pulsedAt'> {
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
  accessToken: User.AccessToken
  username: User.Username
  loginAt: number
  pulsedAt: number
  ip: string
  ua: string
}

export interface IUserInfo {
  token: User.Token
  accessToken: User.AccessToken
  nickname: User.Nickname
  username: User.Username
  expiredAt?: number
  passwordLocked?: boolean
  permissions: UserPermissionType[]
  userPath: string
}
