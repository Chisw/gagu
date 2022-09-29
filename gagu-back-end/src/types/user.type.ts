// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace User {
  export type Token = string
  export type Username = string
  export type Password = string
}

export enum UserPermission {
  view = 'view',
  upload = 'upload',
  delete = 'delete',
}

export type UserPermissionType = keyof typeof UserPermission

export enum UserStatus {
  normal = 'normal',
  forbidden = 'forbidden',
}

export interface UserBase {
  username: User.Username
  password: User.Password
  rootEntryPathList: string[]
  permissionList: UserPermissionType[]
  expiredAt: number
  status: keyof typeof UserStatus
}

export interface IUserForm extends UserBase {
  avatar: string
}

export interface IUser extends UserBase {
  isAdmin: boolean
  createdAt: number
}

export interface IUsersData {
  version: string
  userList: IUser[]
}

export type ILoginMap = { [TOKEN: User.Token]: User.Username }
