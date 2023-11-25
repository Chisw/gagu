import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState } from '../../states'
import { APP_LIST } from '../../apps'
import { AppId, IApp } from '../../types'
import { useClickAway } from '../../hooks'

interface DockProps {
  show: boolean
  activeAppId: string
  setActiveAppId: (id: string) => void
  onUploadClick: () => void
}

export default function Dock(props: DockProps) {
  const {
    show,
    activeAppId,
    setActiveAppId,
    onUploadClick,
  } = props

  const { t } = useTranslation()

  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)

  const [expanded, setExpanded] = useState(false)

  const dockRef = useRef(null)
  
  useClickAway(dockRef, () => setExpanded(false))

  const handleOpenApp = useCallback((app: IApp) => {
    const appId = app.id
    const isActive = appId === activeAppId
    const isRunning = !!runningAppList.find(a => a.id === appId)
    const sameRunningAppList = runningAppList.filter(a => a.id === appId)
    if (isRunning) {
      if (isActive) return
      sameRunningAppList.forEach(app => {
        const windowId = `gagu-app-window-${app.runningId}`
        if (document.getElementById(windowId)!.getAttribute('data-hidden') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .gagu-hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
      })
    } else {
      const list = [...runningAppList, { ...app, runningId: Date.now() }]
      setRunningAppList(list)
    }
  }, [runningAppList, setRunningAppList, activeAppId])

  useEffect(() => {
    if (openOperation) {
      const app = APP_LIST.find(a => a.id === openOperation.appId)!
      setActiveAppId(app.id)
      handleOpenApp(app)
    }
  }, [openOperation, setActiveAppId, handleOpenApp])

  const bottomMenuList = useMemo(() => {
    const bottomMenuList = [
      {
        icon: <SvgIcon.FolderAdd size={18} />,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.FileAdd size={18} />,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.Upload size={18} />,
        onClick: onUploadClick,
      },
    ]
    return bottomMenuList
  }, [onUploadClick])

  return (
    <>
      <div
        ref={dockRef}
        className={line(`
          fixed z-20 
          border shadow-lg overflow-hidden
          transition-all duration-200 select-none
          ${show ? 'scale-100 origin-bottom-right' : 'scale-0 origin-center'}
          ${expanded
            ? 'right-[10px] bottom-[10px] w-48 h-64 rounded-xl bg-gradient-to-b from-gray-200 via-gray-100 to-gray-100'
            : 'right-[1rem] bottom-[1rem] w-12 h-12 rounded-3xl bg-white'
          }
        `)}
      >
        {expanded ? (
          <div className="gagu-dock p-3 grid grid-cols-3 gap-3">
            {bottomMenuList.map(({ icon, onClick }, index) => (
              <div
                key={index}
                className={line(`
                  aspect-square border rounded-lg
                  flex justify-center items-center
                  transition-all duration-200 active:scale-90
                  bg-gradient-to-b from-white via-white to-gray-100
                `)}
                onClick={() => {
                  onClick()
                  setExpanded(false)
                }}
              >
                {icon}
              </div>
            ))}
            {APP_LIST.filter(app => app.touchModeShow).map(app => {
              const appId = app.id
              const isFileExplorer = appId === AppId.fileExplorer
              const isRunning = !!runningAppList.find(a => a.id === app.id)
              return (
                <div
                  key={appId}
                  className="relative aspect-square transition-all duration-50 active:scale-90"
                  title={t(`app.${appId}`)}
                  onClick={() => {
                    setActiveAppId(appId)
                    if (isFileExplorer) return
                    handleOpenApp(app)
                  }}
                >
                  <div
                    className="gagu-app-icon w-full h-full"
                    data-app-id={app.id}
                  />
                  {isRunning && <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-green-400 shadow shadow-green-500 border border-green-700" />}
                </div>
              )
            })}
            <div
              className={line(`
                aspect-square border rounded-lg
                flex justify-center items-center
                transition-all duration-200 active:scale-90
              `)}
              onClick={() => setExpanded(false)}
            >
              <SvgIcon.Close size={18} />
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex justify-center items-center text-gray-800"
            onClick={() => setExpanded(true)}
          >
            <SvgIcon.G />
            {(runningAppList.length > 0) && <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-green-400 shadow shadow-green-500 border border-green-700" />}
          </div>
        )}
      </div>
    </>
  )
}
