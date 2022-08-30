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
  headerClassName?: string
}
