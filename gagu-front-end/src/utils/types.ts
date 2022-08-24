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
  AppComponent: IAppComponent
  width: number
  height: number
  resizeRange: {
    maxWidth?: number
    maxHeight?: number
    minWidth?: number
    minHeight?: number
  }
  matchList?: string[]
}

export enum EntryType {
  directory = 'directory',
  file = 'file',
}

export interface IEntry {
  name: string
  type: EntryType.directory | EntryType.file
  hidden: boolean
  lastModified: number
  parentPath: string
  hasChildren: boolean
  extension: string
  size?: number
}

export interface IRootEntry extends IEntry {
  label: string
  isDisk: boolean
  spaceFree?: number
  spaceTotal?: number
}

export interface IDisk extends IRootEntry {
  spaceFree: number
  spaceTotal: number
}

export interface IRootInfo {
  version: string,
  platform: string,
  deviceName: string
  desktopEntryList: IEntry[]
  rootEntryList: IRootEntry[]
}

export interface IOpenOperation {
  app: IApp
  matchedEntryList: IEntry[]
  activeEntryIndex: number
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
