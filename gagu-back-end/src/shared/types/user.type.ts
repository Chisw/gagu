export type UserValidityType = 'valid' | 'invalid'

export const UserPermission = {
  administer: 'administer',
  read: 'read',
  write: 'write',
  delete: 'delete',
} as const

export type UserPermissionType = keyof typeof UserPermission

export interface IUser {
  nickname: string
  username: string
  password: string
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
  nickname = ''
  username = ''
  password = ''
  password2 = ''
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
  password = ''
  newPassword = ''
  newPassword2 = ''
}

export interface IAuthRecord {
  token: string
  accessToken: string
  username: string
  loginAt: number
  pulsedAt: number
  ip: string
  ua: string
}

export interface IUserInfo {
  token: string
  accessToken: string
  nickname: string
  username: string
  expiredAt?: number
  passwordLocked?: boolean
  permissions: UserPermissionType[]
  userPath: string
}
