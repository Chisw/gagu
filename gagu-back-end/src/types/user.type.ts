// Sync BE & FE
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  type Token = string
  type Username = string
  type Password = string
}

export enum UserPermission {
  view = 'view',
  upload = 'upload',
  delete = 'delete',
}

export enum UserStatus {
  normal = 'normal',
  forbidden = 'forbidden',
}

export type UserPermissionType = keyof typeof UserPermission
export type UserStatusType = keyof typeof UserStatus

export interface IUserBase {
  nickname: string
  username: User.Username
  password: User.Password
  status: UserStatusType
  expiredAt: number
  permissionList: UserPermissionType[]
  rootEntryPathList: string[]
}

export interface IUserForm extends IUserBase {
  avatar: string
}

export class UserForm implements IUserBase {
  avatar = ''
  nickname = ''
  username = ''
  password = ''
  status: UserStatusType = UserStatus.normal
  expiredAt = 0
  permissionList: UserPermissionType[] = []
  rootEntryPathList: string[] = []

  constructor(user?: IUser, avatarPath?: string) {
    if (user) {
      this.avatar = avatarPath || ''
      this.nickname = user.nickname
      this.username = user.username
      this.status = user.status
      this.expiredAt = user.expiredAt
      this.permissionList = user.permissionList
      this.rootEntryPathList = user.rootEntryPathList
    }
  }
}

export interface IUser extends IUserBase {
  isAdmin: boolean
  createdAt: number
}

export interface IUsersData {
  version: string
  userList: IUser[]
}

export type ILoginMap = { [TOKEN: User.Token]: User.Username }
