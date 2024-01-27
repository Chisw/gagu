import { IEntry } from './entry.type'

export interface AppComponentProps {
  isTopWindow: boolean
  windowSize: { width: number, height: number }
  setWindowTitle: (title: string) => void
  closeWindow: () => void
  additionalEntryList?: IEntry[]
}

export interface ExplorerPickProps {
  asEntryPicker?: boolean
  onCurrentPathChange?: (path: string) => void
  onPick?: (entryList: IEntry[]) => void
  onPickDoubleConfirm?: () => void
}

export interface FileExplorerProps extends AppComponentProps, ExplorerPickProps {}

export interface IAppComponent {
  (props: AppComponentProps | FileExplorerProps): JSX.Element
}

export enum AppId {
  fileExplorer = 'file-explorer',
  textEditor = 'text-editor',
  photoViewer = 'photo-viewer',
  musicPlayer = 'music-player',
  videoPlayer = 'video-player',
  androidController = 'android-controller',
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
  additionalEntryList?: IEntry[]
}

export enum EventTransaction {
  run_app = 'run_app',
}

export type EventTransactionType = keyof typeof EventTransaction

export interface IOpenEvent {
  transaction: EventTransactionType | number
  appId: string
  entryList: IEntry[]
  forceOpen?: boolean
}

export enum PlayMode {
  order = 'order',
  single = 'single',
  random = 'random',
}

export type PlayModeType = keyof typeof PlayMode
