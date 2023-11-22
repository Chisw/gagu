import { useCallback, useEffect, useMemo, useState } from 'react'
import { line, vibrate } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState } from '../../states'
import { APP_ID_MAP, APP_LIST } from '../../apps'
import { IApp } from '../../types'

interface DockProps {
  show: boolean
  activeAppId: string
  setActiveAppId: (id: string) => void
  onUploadClick: () => void
}

export default function Dock(props: DockProps) {
  const {
    show,
    // activeAppId,
    setActiveAppId,
    onUploadClick,
  } = props

  const { t } = useTranslation()

  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)

  const [expanded, setExpanded] = useState(false)

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
  }, [openOperation, setActiveAppId, handleOpenApp])

  const bottomMenuList = useMemo(() => {
    const bottomMenuList = [
      {
        icon: <SvgIcon.FolderAdd />,
        name: t`action.newFolder`,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.Upload />,
        name: t`action.upload`,
        onClick: onUploadClick,
      },
      {
        icon: <SvgIcon.CloseCircle />,
        name: t`action.cancel`,
        onClick: () => {
          setExpanded(false)
        },
      },
    ]
    return bottomMenuList
  }, [onUploadClick, t])

  return (
    <>
      <div
        className={line(`
          fixed z-20 
          border shadow-lg bg-white overflow-hidden
          transition-all duration-200 select-none
          ${show ? 'sclae-100 origin-bottom-right' : 'scale-0 origin-center'}
          ${expanded
            ? 'right-[10px] bottom-[10px] w-44 h-64 rounded-xl'
            : 'right-[1rem] bottom-[1rem] w-12 h-12 rounded-3xl'
          }
        `)}
      >
        {expanded ? (
          <div className="p-1 w-44 break-keep">
            <div className="gagu-dock flex flex-wrap justify-start">
              {APP_LIST.filter(app => app.touchModeShow).map(app => {
                const appId = app.id
                const isFileExplorer = appId === APP_ID_MAP.fileExplorer
                return (
                  <div
                    key={appId}
                    className={line(`
                      relative w-10 h-10 flex justify-center items-center
                      transition-all duration-50
                      active:bg-gray-200
                    `)}
                    title={t(`app.${appId}`)}
                    onClick={() => {
                      setActiveAppId(appId)
                      if (isFileExplorer) return
                      handleOpenApp(app)
                    }}
                  >
                    <div
                      className="gagu-app-icon w-8 h-8 rounded-md shadow"
                      data-app-id={app.id}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-2 break-keep">
              {bottomMenuList.map(({ icon, name, onClick }, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 transition-all duration-200 active:scale-95 active:bg-gray-100 rounded-lg break-keep"
                  onClick={() => {
                    vibrate()
                    onClick()
                    setExpanded(false)
                  }}
                >
                  <div className="mr-2">{icon}</div>
                  <div className="text-base">{name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex justify-center items-center text-gray-800"
            onClick={() => {
              vibrate()
              setExpanded(true)
            }}
          >
            <SvgIcon.G />
          </div>
        )}
      </div>
    </>
  )
}
