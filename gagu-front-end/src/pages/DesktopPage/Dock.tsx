import { useCallback, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState, topWindowIndexState, contextMenuDataState, activePageState } from '../../states'
import { APP_LIST, APP_ID_MAP } from '../../apps'
import { IApp, IContextMenuItem } from '../../types'
import { line } from '../../utils'
import { SvgIcon } from '../../components/base'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function Dock() {

  const { t } = useTranslation()

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)
  const [activePage] = useRecoilState(activePageState)

  const handleOpenApp = useCallback((app: IApp, openNew?: boolean) => {
    const sameRunningAppList = runningAppList.filter(a => a.id === app.id)
    const isRunning = !!sameRunningAppList.length
    if (isRunning && !openNew) {
      sameRunningAppList.forEach(app => {
        const windowId = `gagu-app-window-${app.runningId}`
        if (document.getElementById(windowId)!.getAttribute('data-hidden') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .gagu-hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
        const moveToFrontTrigger = document.querySelector(`#${windowId} .gagu-move-to-front-trigger`) as Element
        const mouseDownEvent = new MouseEvent('mousedown')
        moveToFrontTrigger.dispatchEvent(mouseDownEvent)
      })
    } else {
      setTopWindowIndex(topWindowIndex + 1)
      const list = [...runningAppList, { ...app, runningId: Date.now() }]
      setRunningAppList(list)
    }
  }, [topWindowIndex, setTopWindowIndex, runningAppList, setRunningAppList])

  useEffect(() => {
    // console.log('openOperation', openOperation)
    if (openOperation) {
      const app = APP_LIST.find(a => a.id === openOperation.app.id)!
      handleOpenApp(app)
    }
  }, [openOperation, handleOpenApp])

  const handleContextMenu = useCallback((event: any, app: IApp) => {
    const appId = app.id
    const hasRunning = runningAppList.map(o => o.id).includes(appId)
    const { target, clientX, clientY } = event
    const eventData = { target, clientX, clientY }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.Add />,
        label: hasRunning ? t`action.newWindow` : t`action.open`,
        isShow: !hasRunning || app.multiple,
        onClick: () => handleOpenApp(app, true),
      },
      {
        icon: <SvgIcon.Links />,
        label: t`action.newConnection` + ' ⏳',
        isShow: app.id === APP_ID_MAP.fileExplorer,
        onClick: () => toast('⏳'),
      },
      {
        icon: <SvgIcon.Close />,
        label: t`action.closeAllOpenedWindows`,
        isShow: hasRunning,
        onClick: () => {
          const list = runningAppList.filter(app => app.id !== appId)
          setRunningAppList(list)
        },
      },
    ]

    setContextMenuData({ eventData, menuItemList, isDock: true })
  }, [runningAppList, setRunningAppList, handleOpenApp, setContextMenuData, t])

  return (
    <>
      <div
        className={line(`
          gagu-dock
          absolute z-20 left-1/2 bottom-0 mb-2 px-1 h-12
          flex items-center
          border border-gray-500 border-opacity-20
          bg-clip-padding bg-white bg-opacity-40
          rounded-xl
          backdrop-filter backdrop-blur
          transition-all duration-500 ease-out
          -translate-x-1/2
          ${activePage === 'desktop' ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        <div className="flex items-center">
          {APP_LIST.map(app => {
            const isRunning = !!runningAppList.find(a => a.id === app.id)
            return (
              <div
                key={app.id}
                className="relative mx-1 w-8 h-8"
              >
                <div
                  className="gagu-app-icon filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full cursor-pointer shadow rounded-lg"
                  data-app-id={app.id}
                  title={t(`app.${app.id}`)}
                  onClick={() => handleOpenApp(app)}
                  onContextMenu={event => handleContextMenu(event, app)}
                />
                <span
                  className={line(`
                    absolute left-1/2 bottom-0 w-1 h-1 rounded-full bg-black
                    -translate-x-1/2 translate-y-[6px]
                    transition-all duration-300
                    ${isRunning ? 'opacity-100' : 'opacity-0'}
                  `)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
