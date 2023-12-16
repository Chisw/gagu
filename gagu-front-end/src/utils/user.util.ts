import { UserPermission, UserPermissionType } from '../types'

const permissionSortMap = {
  [UserPermission.administer]: 0,
  [UserPermission.read]: 1,
  [UserPermission.write]: 2,
  [UserPermission.delete]: 3,
}

export const permissionSorter = (prev: UserPermissionType, next: UserPermissionType) => {
  return permissionSortMap[prev] > permissionSortMap[next] ? 1 : -1
}
