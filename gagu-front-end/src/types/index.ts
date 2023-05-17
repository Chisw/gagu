export * from './common.type'
export * from './app.type'
export * from './entry.type'
export * from './transfer.type'
export * from './user.type'
export * from './tunnel.type'
export * from './setting.type'

export type PageType = 'PENDING' | 'login' | 'desktop' | 'explore' | 'touch' | 'sharing'
export type PublicImageName = 'bg-desktop' | 'bg-sharing' | 'favicon'

export interface IResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface IVisitHistory {
  position: number
  list: string[]
}

export interface IRectInfo {
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
  label: string
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
