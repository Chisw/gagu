import { EntryType, IEntry } from './entry.type'

export interface AppComponentProps {
  isTopWindow: boolean
  windowSize: { width: number, height: number }
  setWindowTitle: (title: string) => void
  closeWindow: () => void
  additionalEntryList?: IEntry[]
}

export interface ExplorerSelectorProps {
  asSelector?: boolean
  onCurrentPathChange?: (path: string) => void
  onSelect?: (entryList: IEntry[]) => void
  onSelectDoubleConfirm?: () => void
}

export interface FileExplorerProps extends AppComponentProps, ExplorerSelectorProps {}

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
  extraData?: { [KEY: string]: any }
}

export interface IEntrySelectorEvent {
  transaction: EventTransactionType | number
  mode: 'open' | 'save'
  appId: string
  type?: EntryType.directory | EntryType.file
  multiple?: boolean
}

export enum PlayMode {
  order = 'order',
  single = 'single',
  random = 'random',
}

export type PlayModeType = keyof typeof PlayMode
