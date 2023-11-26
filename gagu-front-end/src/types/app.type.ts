import { EntryType, IEntry } from './entry.type'

export interface AppComponentProps {
  isTopWindow: boolean
  windowSize: { width: number, height: number }
  setWindowTitle: (title: string) => void
  onClose: () => void
}

export interface FileExplorerProps extends AppComponentProps {
  asSelector?: boolean
  onSelect?: (entryList: IEntry[]) => void
  onSelectConfirm?: () => void
}

export interface IAppComponent {
  (props: AppComponentProps | FileExplorerProps): JSX.Element
}

export enum AppId {
  fileExplorer = 'file-explorer',
  transfer = 'transfer',
  textEditor = 'text-editor',
  photoViewer = 'photo-viewer',
  musicPlayer = 'music-player',
  videoPlayer = 'video-player',
  settings = 'settings',
  baiduMap = 'baidu-map',
  pqina = 'pqina',
}

export interface IApp {
  id: string
  runningId: number
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
  headerClassName?: string
  multiple?: boolean
  touchModeShow?: boolean
}

export interface IOpenOperation {
  appId: string
  entryList: IEntry[]
  force?: boolean
}

export interface IEntrySelectorOperation {
  appId: string
  multiple?: boolean
  type?: EntryType.directory | EntryType.file
  saveMode?: boolean
}
