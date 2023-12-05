import { ServerMessage } from './common.type'
import { IEntry, SortType } from './entry.type'

export * from './common.type'
export * from './app.type'
export * from './entry.type'
export * from './transfer.type'
export * from './user.type'
export * from './tunnel.type'
export * from './setting.type'

export enum Page {
  PENDING = 'PENDING',
  login = 'login',
  desktop = 'desktop',
  explore = 'explore',
  touch = 'touch',
  sharing = 'sharing',
}

export type PageType = keyof typeof Page

export enum EditMode {
  createFolder = 'createFolder',
  createText = 'createText',
  rename = 'rename',
}

export type EditModeType = keyof typeof EditMode

export type CreationType = EditMode.createFolder | EditMode.createText

export enum NameFail {
  cancel = 'cancel',
  empty = 'empty',
  existed = 'existed',
  invalid = 'invalid',
}

export type NameFailType = keyof typeof NameFail

export type PublicImageName = 'bg-desktop' | 'bg-sharing' | 'favicon'
export type ThumbnailType = 'video' | 'audio' | 'image'
export type WindowStatus = 'opening' | 'opened' | 'hiding' | 'hidden' | 'showing' | 'shown' | 'closing' | 'closed'

export interface IScrollerWatcher {
  top: number
  height: number
}

export interface IResponse<T = undefined> {
  success: boolean
  message: keyof typeof ServerMessage
  data: T
}

export interface IVisitHistory {
  position: number
  list: string[]
}

export interface ILassoInfo {
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface IOffsetInfo {
  offsetTop: number
  offsetLeft: number
  offsetWidth: number
  offsetHeight: number
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

export interface IEntryPathMapRes {
  list?: IEntry[]
  hiddenShow?: boolean
  gridMode?: boolean
  sortType?: SortType
}

export interface IEntryPathMap {
  [ENTRY_PATH: string]: IEntryPathMapRes | undefined
}
