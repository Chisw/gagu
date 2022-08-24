import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState, topWindowIndexState, rootInfoState } from '../../utils/state'
import APP_LIST from '../../utils/appList'
import { IApp, IRootInfo } from '../../utils/types'
import { line } from '../../utils'
import { DateTime } from 'luxon'
import { useFetch } from '../../hooks'
import { AuthApi, FsApi } from '../../api'
import { DOCUMENT_TITLE, GAGU_AUTH_KEY } from '../../utils/constant'
import { SvgIcon } from '../../components/base'
import { useNavigate } from 'react-router-dom'

export default function Dock() {

  const navigate = useNavigate()
  const [timeStr, setTimerStr] = useState('----/--/-- 星期- --:--')

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)
  const [isMounted, setIsMounted] = useState(false)

  const { fetch, loading, data } = useFetch(FsApi.getEntryList)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)

  useEffect(() => {
    fetch('/')
  }, [fetch])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (data) {
      const { version, platform, deviceName, desktopEntryList, entryList: rootEntryList } = data
      setRootInfo({ version, platform, deviceName, desktopEntryList, rootEntryList } as IRootInfo)
    }
  }, [data, setRootInfo])

  useEffect(() => {
    document.title = `${rootInfo ? `${rootInfo.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [rootInfo])

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      const str = now.toFormat('yyyy/MM/dd 星期几 HH:mm')
      const day = '一二三四五六日'[+now.toFormat('c') - 1]
      setTimerStr(str.replace('星期几', `星期${day}`))
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
        onClick: () => fetch('/'),
      },
      {
        text: '退出',
        icon: <SvgIcon.Logout />,
        onClick: () => {
          localStorage.removeItem(GAGU_AUTH_KEY)
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
  }, [fetch, navigate, shutdown])

  const handleOpenApp = useCallback((app: IApp) => {
    const sameRunningAppList = runningAppList.filter(a => a.id === app.id)
    const isRunning = !!sameRunningAppList.length
    if (isRunning) {
      sameRunningAppList.forEach(app => {
        const windowId = `window-${app.runningId}`
        if (document.getElementById(windowId)!.getAttribute('data-hidden') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
        const moveToFrontTrigger = document.querySelector(`#${windowId} .move-to-front-trigger`) as Element
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
    console.log('openOperation', openOperation)
    if (openOperation) {
      const app = APP_LIST.find(a => a.id === openOperation.app.id)!
      handleOpenApp(app)
    }
  }, [openOperation, handleOpenApp])

  return (
    <>
      <div
        className={line(`
          gagu-dock
          fixed z-20 right-0 bottom-0 left-0 px-2 h-10
          flex justify-between items-center
          border-t border-gray-500 border-opacity-20
          bg-clip-padding bg-white-500
          backdrop-filter backdrop-blur
          transition-all duration-500
          transform
          ${isMounted ? 'translate-y-0' : 'translate-y-20'}
        `)}
      >
        <div className="w-32 flex-shrink-0">
          <div className="relative w-6 h-6 flex justify-center items-center hover:bg-white-600 hover:text-black active:bg-white-500 group">
            <SvgIcon.Dashboard />
            <div className="absolute left-0 bottom-0 mb-6 bg-white-900 hidden group-hover:block">
              <div className="py-2 flex justify-center items-center text-gray-500">
                <a
                  href="https://gagu.io"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8"
                >
                  <div className="gagu-logo w-16 h-8" />
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
                className="relative mx-2 w-6 h-6"
              >
                <div
                  className="app-icon filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full cursor-pointer"
                  data-app-id={app.id}
                  title={app.title}
                  onClick={() => handleOpenApp(app)}
                />
                <span
                  className={line(`
                    absolute left-1/2 bottom-0 w-4 h-2 bg-blue-500
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
