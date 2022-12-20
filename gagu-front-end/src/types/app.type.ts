import { IEntry } from './entry.type'

export interface AppComponentProps {
  isTopWindow: boolean
  windowSize: { width: number, height: number }
  setWindowLoading: (loading: boolean) => void
  setWindowTitle: (title: string) => void
}

interface IAppComponent {
  (props: AppComponentProps): JSX.Element
}

export interface IApp {
  id: string
  runningId: number
  name: string
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
}

export interface IOpenOperation {
  app: IApp
  matchedEntryList: IEntry[]
  activeEntryIndex: number
}
