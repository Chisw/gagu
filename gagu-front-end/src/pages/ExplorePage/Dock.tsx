import { useCallback, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { openEventState, runningAppListState, activePageState } from '../../states'
import { APP_LIST } from '../../apps'
import { AppId, EventTransaction, IApp, Page } from '../../types'
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
  const [openEvent] = useRecoilState(openEventState)
  const [activePage] = useRecoilState(activePageState)

  const handleOpenApp = useCallback((app: IApp) => {
    const isRunning = !!runningAppList.find(a => a.id === app.id)
    if (isRunning) return
    const list = [...runningAppList, { ...app, runningId: Date.now() }]
    setRunningAppList(list)
  }, [runningAppList, setRunningAppList])

  useEffect(() => {
    if (openEvent?.transaction === EventTransaction.run_app) {
      const app = APP_LIST.find(a => a.id === openEvent.appId)!
      setActiveAppId(app.id)
      handleOpenApp(app)
    }
  }, [openEvent, handleOpenApp, setActiveAppId])

  return (
    <>
      <div
        className={line(`
          gagu-dock
          absolute z-0 bottom-0 px-1 w-full h-10 border-t border-gray-300 bg-gray-300
          bg-gradient-to-b from-gray-200 to-gray-400
          flex justify-center items-center
          transition-all duration-500 ease-out
          dark:border-zinc-600 dark:from-zinc-700 dark:to-zinc-900
          ${activePage === Page.explore ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        {APP_LIST.map(app => {
          const appId = app.id
          const isActive = appId === activeAppId
          const isFileExplorer = appId === AppId.fileExplorer
          const isRunning = isFileExplorer || !!runningAppList.find(a => a.id === appId)
          return (
            <div
              key={appId}
              className={line(`
                relative w-10 h-10 flex justify-center items-center
                transition-all duration-50
                ${isActive
                  ? 'bg-gray-100 dark:bg-zinc-500'
                  : 'hover:bg-gray-200 active:bg-gray-400 cursor-pointer dark:hover:bg-zinc-600 dark:active:bg-zinc-900'}
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
