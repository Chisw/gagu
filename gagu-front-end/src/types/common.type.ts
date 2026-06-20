import { IEntry, SortType } from '@shared'

export const Page = {
  PENDING: 'PENDING',
  login: 'login',
  desktop: 'desktop',
  explorer: 'explorer',
  touch: 'touch',
  sharing: 'sharing',
} as const

export type PageType = keyof typeof Page

export const ClipboardType = {
  copy: 'copy',
  cut: 'cut',
} as const

export type ClipboardTypeType = keyof typeof ClipboardType

export interface IClipboardData {
  type: ClipboardTypeType
  entryList: IEntry[]
}

export type ClipboardState = ClipboardTypeType | undefined

export const EditMode = {
  createFolder: 'createFolder',
  createText: 'createText',
  rename: 'rename',
} as const

export type EditModeType = keyof typeof EditMode

export type CreationType = typeof EditMode.createFolder | typeof EditMode.createText

export const NameFail = {
  cancel: 'cancel',
  empty: 'empty',
  existed: 'existed',
  invalid: 'invalid',
} as const

export type NameFailType = keyof typeof NameFail

export type PublicImageName = 'bg-desktop' | 'bg-sharing' | 'favicon'
export type WindowStatus = 'opening' | 'opened' | 'hiding' | 'hidden' | 'showing' | 'shown' | 'closing' | 'closed'

export interface IVisitHistory {
  position: number
  list: string[]
}

export interface ILasso {
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface IOffset {
  offsetTop: number
  offsetLeft: number
  offsetWidth: number
  offsetHeight: number
}

export interface IBound {
  top: number
  left: number
  width: number
  height: number
}

export interface IContextMenuItem {
  icon: JSX.Element
  name: string
  onClick: () => void
  isShow?: boolean
  children?: IContextMenuItem[]
}

export interface IContextMenuState {
  eventData: {
    target: HTMLElement
    clientX: number
    clientY: number
  }
  menuItemList: IContextMenuItem[]
  isDock?: boolean
}

export interface IBoundedEntry extends IEntry {
  bound: IBound
}

export interface IVirtualBox {
  width: number
  height: number
  marginX: number
  marginY: number
}

export interface IVirtualContainer {
  padding: number
  rows: number
  cols: number
}

export interface IEntryPathCacheData {
  list?: IEntry[]
  hiddenVisible?: boolean
  gridMode?: boolean
  sortType?: SortType
}

export interface IEntryPathCache {
  [ENTRY_PATH: string]: IEntryPathCacheData | undefined
}

export interface IBrowserWindowSize {
  MENU_BAR_HEIGHT: number
  DOC_OFFSET: number
  width: number
  height: number
  // for desktop mode
  safeHeight: number
}

export interface IAppWindowSize {
  width: number
  height: number
}

export interface IAppWindowInfo extends IAppWindowSize {
  x: number
  y: number
}

export interface IAppWindowInfoMap { [APP_ID: string]: IAppWindowInfo }

export interface IAppWindowRatio {
  xRatio: number
  yRatio: number
  widthRatio: number
  heightRatio: number
}

export type EntryPickerMode = 'open' | 'save'
