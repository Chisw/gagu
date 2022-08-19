import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { openedEntryListState, runningAppListState, topWindowIndexState, rootInfoState } from '../../utils/state'
import APP_LIST from '../../utils/appList'
import { IApp, IRootInfo } from '../../utils/types'
import { line } from '../../utils'
import { DateTime } from 'luxon'
import useFetch from '../../hooks/useFetch'
import { AuthApi, FsApi } from '../../api'
import { DOCUMENT_TITLE, GAGU_AUTH_KEY, GAGU_CURRENT_VERSION } from '../../utils/constant'
import RemixIcon from '../../img/remixicon'
import { useNavigate } from 'react-router-dom'
import LogoSvg from '../../img/logo.svg'

export default function Dock() {

  const navigate = useNavigate()
  const [timeStr, setTimerStr] = useState('----/--/-- 星期- --:--')

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)

  const { fetch, loading, data } = useFetch(FsApi.getEntryList)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)

  useEffect(() => {
    fetch('/')
  }, [fetch])

  useEffect(() => {
    if (data) {
      const { deviceName, entryList: rootEntryList } = data
      setRootInfo({ deviceName, rootEntryList } as IRootInfo)
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
        icon: <RemixIcon.Fullscreen />,
        onClick: () => document.querySelector('html')?.requestFullscreen(),
      },
      {
        text: '刷新',
        icon: <RemixIcon.Refresh />,
        onClick: () => fetch('/'),
      },
      {
        text: '退出',
        icon: <RemixIcon.Logout />,
        onClick: () => {
          localStorage.removeItem(GAGU_AUTH_KEY)
          navigate('/login')
        },
      },
      {
        text: '关闭系统',
        icon: <RemixIcon.ShutDown />,
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
    console.log('openedEntryList', openedEntryList)
    const openedEntry = openedEntryList[0]
    if (openedEntry) {
      const app = APP_LIST.find(a => a.id === openedEntry.openAppId)!
      handleOpenApp(app)
    }
  }, [openedEntryList, setOpenedEntryList, handleOpenApp])

  return (
    <>
      <div className="fixed z-20 right-0 bottom-0 left-0 p-2 bg-white-500 flex justify-between items-center backdrop-filter backdrop-blur border-t border-gray-500 border-opacity-20 bg-clip-padding">
        <div className="w-32 flex-shrink-0">
          <div className="relative w-6 h-6 flex justify-center items-center hover:bg-white-600 hover:text-black active:bg-white-500 group">
            <RemixIcon.Dashboard />
            <div className="absolute left-0 bottom-0 mb-6 bg-white-900 hidden group-hover:block">
              <div className="py-2 flex justify-center items-center text-gray-500">
                <a
                  href="https://gagu.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={LogoSvg}
                    alt="GAGU"
                    className="inline-block h-8"
                  />
                </a>
                &nbsp;
                <a
                  href="https://github.com/Chisw/gagu"
                  target="_blank"
                  rel="noreferrer"
                >
                  <RemixIcon.Github />
                </a>
                &nbsp;
                <span className="text-xs font-din">
                  {GAGU_CURRENT_VERSION}
                </span>
              </div>
              <div className="w-56 py-1">
                <div className="mb-1 p-2 border-t border-b text-xs text-gray-600">
                  {loading ? '系统加载中' : `${rootInfo.deviceName} 已连接`}
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
                  className="filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full bg-no-repeat bg-center bg-contain cursor-pointer"
                  title={app.title}
                  style={{ backgroundImage: `url("${app.icon}")` }}
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
