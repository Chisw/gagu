export * from './app.type'
export * from './entry.type'
export * from './transfer.type'
export * from './user.type'
export * from './download.type'
export * from './setting.type'

export interface IHistory {
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
