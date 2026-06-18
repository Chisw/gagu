import { IEntry } from '@shared'

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

export const AppId = {
  fileExplorer: 'file-explorer',
  textEditor: 'text-editor',
  docReader: 'doc-reader',
  photoViewer: 'photo-viewer',
  musicPlayer: 'music-player',
  videoPlayer: 'video-player',
  webBrowser: 'web-browser',
  androidController: 'android-controller',
  settings: 'settings',
} as const

export interface IApp {
  id: string
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

export interface IRunningApp extends IApp {
  runningId: number
  visible: boolean
}

export const EventTransaction = {
  run_app: 'run_app',
} as const

export type EventTransactionType = keyof typeof EventTransaction

export interface IOpenEvent {
  transaction: EventTransactionType | number
  appId: string
  entryList: IEntry[]
  forceOpen?: boolean
}

export const PlayMode = {
  order: 'order',
  single: 'single',
  random: 'random',
} as const

export type PlayModeType = keyof typeof PlayMode
