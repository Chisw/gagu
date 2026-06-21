import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { openEventState, runningAppListState, topWindowIndexState, contextMenuDataState, activePageState } from '../../states'
import { APP_LIST } from '../../apps'
import { AppId, EventTransaction, IApp, IContextMenuItem, Page } from '../../types'
import { UserConfigStore, line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { getContextMenuDelay } from '../../components'
import { genRunningApp } from '../../utils/app.util'

export default function Dock() {

  const { t } = useTranslation()

  const [loaded, setLoaded] = useState(false)
  const [, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openEvent] = useRecoilState(openEventState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)
  const [activePage] = useRecoilState(activePageState)

  const handleOpenApp = useCallback((app: IApp, openNew?: boolean) => {
    const sameRunningAppList = runningAppList.filter(a => a.id === app.id)
    const isRunning = !!sameRunningAppList.length
    if (isRunning && !openNew) {
      // switch from hiding to showing
      sameRunningAppList.forEach(app => {
        const windowId = `gagu-app-window-${app.runningId}`
        if (document.getElementById(windowId)?.getAttribute('data-minimized') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .gagu-hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
        const moveToFrontTrigger = document.querySelector(`#${windowId} .gagu-move-to-front-trigger`) as Element
        const mouseDownEvent = new MouseEvent('mousedown')
        moveToFrontTrigger.dispatchEvent(mouseDownEvent)
      })
    } else {
      setTopWindowIndex(i => i + 1)
      setRunningAppList((list) => [...list, genRunningApp(app)])
    }
  }, [setTopWindowIndex, runningAppList, setRunningAppList])

  useEffect(() => {
    setTimeout(() => {
      if (!loaded && UserConfigStore.get().fileExplorerAutoOpen) {
        const app = APP_LIST.find(a => a.id === AppId.fileExplorer)!
        setRunningAppList([genRunningApp(app)])
        setLoaded(true)
      }
    }, 1000)
  }, [loaded, setRunningAppList])

  useEffect(() => {
    if (openEvent?.transaction === EventTransaction.run_app) {
      const app = APP_LIST.find(a => a.id === openEvent.appId)!
      handleOpenApp(app)
    }
  }, [openEvent, handleOpenApp])

  const handleContextMenu = useCallback((event: any, app: IApp) => {
    const appId = app.id
    const hasRunning = runningAppList.map(o => o.id).includes(appId)
    const { target, clientX, clientY } = event
    const eventData = { target, clientX, clientY }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.Add />,
        name: hasRunning ? t`action.newWindow` : t`action.open`,
        isShow: !hasRunning || app.multiple,
        onClick: () => handleOpenApp(app, true),
      },
      // {
      //   icon: <SvgIcon.Links />,
      //   name: t`action.newConnection` + ' ⏳',
      //   isShow: app.id === AppId.fileExplorer,
      //   onClick: () => toast('⏳'),
      // },
      {
        icon: <SvgIcon.Close />,
        name: t`action.closeAllOpenedWindows`,
        isShow: hasRunning,
        onClick: () => {
          const list = runningAppList.filter(app => app.id !== appId)
          setRunningAppList(list)
        },
      },
    ]

    setTimeout(() => {
      setContextMenuData({ eventData, menuItemList, isDock: true })
    }, getContextMenuDelay())
  }, [runningAppList, setRunningAppList, handleOpenApp, setContextMenuData, t])

  return (
    <>
      <div
        className={line(`
          gagu-dock
          absolute z-20 left-1/2 bottom-0 mb-1 px-1 h-12
          flex items-center
          border border-gray-500/20
          bg-clip-padding bg-white/40 backdrop-blur-sm
          rounded-xl
          transition-all duration-500 ease-out
          -translate-x-1/2
          dark:bg-black/20
          ${activePage === Page.desktop ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        {APP_LIST.map(app => {
          const isRunning = !!runningAppList.find(a => a.id === app.id)
          return (
            <div
              key={app.id}
              className="relative mx-1 w-8 h-8"
            >
              <div
                className="gagu-app-icon filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full cursor-pointer shadow-sm rounded-lg"
                data-app-id={app.id}
                title={t(`app.${app.id}`)}
                onClick={() => handleOpenApp(app)}
                onContextMenu={event => handleContextMenu(event, app)}
              />
              <span
                className={line(`
                  absolute left-1/2 bottom-0 w-1 h-1 rounded-full bg-black/60
                  -translate-x-1/2 translate-y-1.5
                  transition-all duration-300
                  ${isRunning ? 'opacity-100' : 'opacity-0'}
                `)}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
