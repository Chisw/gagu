import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState, topWindowIndexState, rootInfoState, contextMenuDataState } from '../../states'
import { APP_LIST, APP_ID_MAP } from '../../apps'
import { IApp, IContextMenuItem, IRootInfo } from '../../types'
import { line, TOKEN } from '../../utils'
import { DateTime } from 'luxon'
import { useFetch } from '../../hooks'
import { AuthApi, FsApi } from '../../api'
import { DOCUMENT_TITLE } from '../../utils'
import { SvgIcon } from '../../components/base'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dock() {

  const navigate = useNavigate()
  const [timeStr, setTimerStr] = useState('----/--/-- 周- --:--')

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const [isEffected, setIsEffected] = useState(false)

  const { fetch: getRootEntryList, loading, data } = useFetch(FsApi.getRootEntryList)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)
  const { fetch: logout } = useFetch(AuthApi.logout)

  useEffect(() => {
    getRootEntryList()
  }, [getRootEntryList])

  useEffect(() => {
    setIsEffected(true)
  }, [])

  useEffect(() => {
    if (data) {
      setRootInfo(data as IRootInfo)
    }
  }, [data, setRootInfo])

  useEffect(() => {
    document.title = `${rootInfo ? `${rootInfo.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [rootInfo])

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      const str = now.toFormat('yyyy/MM/dd 周几 HH:mm')
      const day = '一二三四五六日'[+now.toFormat('c') - 1]
      setTimerStr(str.replace('周几', `周${day}`))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])


  const buttonList = useMemo(() => {
    return [
      {
        text: '进入全屏',
        icon: <SvgIcon.Fullscreen />,
        onClick: () => document.querySelector('html')?.requestFullscreen(),
      },
      {
        text: '刷新',
        icon: <SvgIcon.Refresh />,
        onClick: () => getRootEntryList(),
      },
      {
        text: '退出',
        icon: <SvgIcon.Logout />,
        onClick: async () => {
          await logout()
          TOKEN.remove()
          navigate('/login')
        },
      },
      {
        text: '关闭系统',
        icon: <SvgIcon.ShutDown />,
        onClick: () => {
          shutdown()
          window.close()
        },
      },
    ]
  }, [getRootEntryList, navigate, shutdown, logout])

  const handleOpenApp = useCallback((app: IApp, openNew?: boolean) => {
    const sameRunningAppList = runningAppList.filter(a => a.id === app.id)
    const isRunning = !!sameRunningAppList.length
    if (isRunning && !openNew) {
      sameRunningAppList.forEach(app => {
        const windowId = `gg-app-window-${app.runningId}`
        if (document.getElementById(windowId)!.getAttribute('data-hidden') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .gg-hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
        const moveToFrontTrigger = document.querySelector(`#${windowId} .gg-move-to-front-trigger`) as Element
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
    const canMultiple = ![APP_ID_MAP.musicPlayer, APP_ID_MAP.transfer, APP_ID_MAP.baiduMap, APP_ID_MAP.ps, APP_ID_MAP.pqina].includes(appId)
    const hasRunning = runningAppList.map(o => o.id).includes(appId)
    const { target, clientX, clientY } = event
    const eventData = { target, clientX, clientY }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.Add />,
        label: hasRunning ? '新建窗口' : '打开',
        isShow: !hasRunning || canMultiple,
        onClick: () => handleOpenApp(app, true),
      },
      {
        icon: <SvgIcon.Links />,
        label: '新建连接',
        isShow: app.id === APP_ID_MAP.fileExplorer,
        onClick: () => toast.error('开发中'),
      },
      {
        icon: <SvgIcon.Close />,
        label: '关闭所有窗口',
        isShow: hasRunning,
        onClick: () => {
          const list = runningAppList.filter(app => app.id !== appId)
          setRunningAppList(list)
        },
      },
    ]

    setContextMenuData({ eventData, menuItemList, isDock: true })
  }, [runningAppList, setRunningAppList, handleOpenApp, setContextMenuData])

  return (
    <>
      <div
        className={line(`
          gg-dock
          absolute z-20 right-0 bottom-0 left-0 px-2 h-12
          flex justify-between items-center
          border-t border-gray-500 border-opacity-20
          bg-clip-padding bg-white-600
          backdrop-filter backdrop-blur
          transition-all duration-500
          transform
          ${isEffected ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        <div className="w-32 flex-shrink-0">
          <div className="relative w-6 h-6 rounded-sm flex justify-center items-center hover:bg-white-600 hover:text-black active:bg-white-500 group">
            <SvgIcon.G />
            <div className="absolute left-0 bottom-0 mb-6 bg-white-900 hidden group-hover:block">
              <div className="py-2 flex justify-center items-center text-gray-500">
                <a
                  href="https://gagu.io"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8"
                >
                  <div className="gg-logo w-16 h-8" />
                </a>
                &nbsp;
                <span className="text-xs font-din">
                  {rootInfo.version}
                </span>
                &nbsp;
                <a
                  href="https://github.com/Chisw/gagu"
                  target="_blank"
                  rel="noreferrer"
                >
                  <SvgIcon.Github />
                </a>
              </div>
              <div className="w-56 py-1 backdrop-filter backdrop-blur">
                <div className="mb-1 p-2 border-t border-b text-xs text-gray-600">
                  {loading ? '系统加载中' : `${rootInfo.deviceName} [${rootInfo.platform}] 已连接`}
                </div>
                {buttonList.map(({ text, icon, onClick }, buttonIndex) => (
                  <button
                    key={buttonIndex}
                    className="mb-1 px-2 py-1 w-full text-left hover:bg-gray-200 flex items-center select-none"
                    onClick={onClick}
                  >
                    {icon}
                    <span className="ml-2 text-sm">
                      {text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {APP_LIST.map(app => {
            const isRunning = !!runningAppList.find(a => a.id === app.id)
            return (
              <div
                key={app.id}
                className="relative mx-2 w-8 h-8"
              >
                <div
                  className="gg-app-icon filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full cursor-pointer shadow rounded-lg"
                  data-app-id={app.id}
                  title={app.title}
                  onClick={() => handleOpenApp(app)}
                  onContextMenu={event => handleContextMenu(event, app)}
                />
                <span
                  className={line(`
                    absolute left-1/2 bottom-0 w-4 h-2 bg-blue-600
                    transform -translate-x-1/2 translate-y-3
                    transition-all duration-300
                    ${isRunning ? 'opacity-100' : 'opacity-0'}
                  `)}
                />
              </div>
            )
          })}
        </div>
        <div className="w-32 flex-shrink-0 text-center text-xs leading-none font-din">
          {timeStr}
        </div>
      </div>
    </>
  )
}
