import { IAppWindowInfoMap, PlayModeType } from '.'

export const HotkeyStyle = {
  mac: 'mac',
  win: 'win',
} as const

export const ColorScheme = {
  auto: 'auto',
  light: 'light',
  dark: 'dark',
} as const

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
  windowInfoMap: IAppWindowInfoMap
}
