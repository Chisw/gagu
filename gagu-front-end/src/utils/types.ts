import { ReactNode } from 'react'


export interface AppComponentProps {
  isTopWindow: boolean
  setWindowLoading: (loading: boolean) => void
  setWindowTitle: (title: string) => void
}

interface IAppComponent {
  (props: AppComponentProps): JSX.Element
}

export interface IApp {
  id: string
  runningId: number
  title: string
  icon: string
  AppComponent: IAppComponent
  width: number
  height: number
  resizeRange: {
    maxWidth?: number
    maxHeight?: number
    minWidth?: number
    minHeight?: number
  }
  bgImg?: string
  matchList?: string[]
}

export interface IVolume {
  name: string
  mount: string
  hasChildren: boolean
  spaceFree: number
  spaceTotal: number
  isVolume: boolean
}

export interface IRootInfo {
  deviceName: string
  volumeList: IVolume[]
}

export interface IEntry {
  name: string
  type: 'directory' | 'file'
  parentPath: string
  extension?: string
  size?: number
  hidden?: boolean
  lastModified?: number
  hasChildren?: boolean
}

export interface IOpenedEntry extends IEntry {
  openAppId: string
  isOpen: boolean
}

export interface IEntryIcon {
  type: string
  icon: ReactNode
  iconClassName: string
  matchList: string[]
}

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

// 多层文件夹上传时的嵌套路径，包含文件名
export interface INestedFile extends File {
  nestedPath?: string
}

export interface IUploadTask {
  id: string
  nestedFile: INestedFile
  destDir?: string
  status: 'waiting' | 'uploading' | 'success' | 'fail' | 'cancel'
  abortController?: AbortController
}
