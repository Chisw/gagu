import { useCallback, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState, activePageState } from '../../states'
import { APP_ID_MAP, APP_LIST } from '../../apps'
import { IApp, Page } from '../../types'
import { line } from '../../utils'
import { useTranslation } from 'react-i18next'

interface DockProps {
  activeAppId: string
  setActiveAppId: (id: string) => void
}

export default function Dock(props: DockProps) {

  const { activeAppId, setActiveAppId } = props

  const { t } = useTranslation()

  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)
  const [activePage] = useRecoilState(activePageState)

  const handleOpenApp = useCallback((app: IApp) => {
    const isRunning = !!runningAppList.find(a => a.id === app.id)
    if (isRunning) return
    const list = [...runningAppList, { ...app, runningId: Date.now() }]
    setRunningAppList(list)
  }, [runningAppList, setRunningAppList])

  useEffect(() => {
    if (openOperation) {
      const app = APP_LIST.find(a => a.id === openOperation.app.id)!
      setActiveAppId(app.id)
      handleOpenApp(app)
    }
  }, [openOperation, handleOpenApp, setActiveAppId])

  return (
    <>
      <div
        className={line(`
          gagu-dock
          absolute z-0 bottom-0 px-1 w-full h-10 bg-gray-300
          flex justify-center items-center
          transition-all duration-500 ease-out
          ${activePage === Page.explore ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        {APP_LIST.map(app => {
          const appId = app.id
          const isAcive = appId === activeAppId
          const isFileExplorer = appId === APP_ID_MAP.fileExplorer
          const isRunning = isFileExplorer || !!runningAppList.find(a => a.id === appId)
          return (
            <div
              key={appId}
              className={line(`
                relative w-10 h-10 flex justify-center items-center
                transition-all duration-50
                ${isAcive ? 'bg-gray-100' : 'hover:bg-gray-200 active:bg-gray-400 cursor-pointer'}
              `)}
              title={t(`app.${appId}`)}
              onClick={() => {
                setActiveAppId(appId)
                if (isFileExplorer) return
                handleOpenApp(app)
              }}
            >
              <div
                className="gagu-app-icon w-6 h-6 rounded-md shadow"
                data-app-id={app.id}
              />
              {isRunning && <div className="absolute right-3 bottom-0 left-3 h-[3px] bg-blue-500" />}
            </div>
          )
        })}
      </div>
    </>
  )
}