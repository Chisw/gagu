import { ColorScheme, HotkeyStyle, IUserConfig, PlayMode, UserPermission, UserPermissionType } from '../types'

const permissionSortMap = {
  [UserPermission.administer]: 0,
  [UserPermission.read]: 1,
  [UserPermission.write]: 2,
  [UserPermission.delete]: 3,
}

export const permissionSorter = (prev: UserPermissionType, next: UserPermissionType) => {
  return permissionSortMap[prev] > permissionSortMap[next] ? 1 : -1
}

export const getDefaultUserConfig = () => {
  const config: IUserConfig = {
    hotkeyStyle: HotkeyStyle.mac,
    kiloSize: 1000,
    colorScheme: ColorScheme.auto,
    fileExplorerAutoOpen: false,
    fileExplorerDefaultPath: '',
    fileExplorerSideCollapse: false,
    textEditorFontSize: 14,
    musicPlayerVolume: 0.5,
    musicPlayerCoverDisk: false,
    musicPlayerPlayMode: PlayMode.order,
    videoPlayerVolume: 0.5,
    windowInfoMap: {},
  }
  return config
}
