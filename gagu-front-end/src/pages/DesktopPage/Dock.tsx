import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { openOperationState, runningAppListState, topWindowIndexState, contextMenuDataState, userInfoState } from '../../states'
import { APP_LIST, APP_ID_MAP } from '../../apps'
import { IApp, IContextMenuItem } from '../../types'
import { line, PULSE_INTERVAL, USER_INFO } from '../../utils'
import { useFetch } from '../../hooks'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dock() {

  const navigate = useNavigate()

  const [isEffected, setIsEffected] = useState(false)

  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openOperation] = useRecoilState(openOperationState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const { fetch: pulse } = useFetch(AuthApi.pulse)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)
  const { fetch: logout } = useFetch(AuthApi.logout)

  useEffect(() => {
    setIsEffected(true)
  }, [])

  useEffect(() => {
    if (!userInfo) {
      const info = USER_INFO.get()
      if (info) {
        setUserInfo(info)
      } else {
        navigate('/login')
      }
    }
  }, [userInfo, setUserInfo, navigate])

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await pulse()
      if (res.success) {
        setUserInfo(res.userInfo)
        USER_INFO.set(res.userInfo)
      } else {
        toast.error(res.message)
      }
    }, PULSE_INTERVAL)
    return () => clearInterval(timer)
  }, [pulse, setUserInfo])

  const buttonList = useMemo(() => {
    return [
      {
        text: '进入全屏',
        icon: <SvgIcon.Fullscreen />,
        onClick: () => document.querySelector('html')?.requestFullscreen(),
      },
      {
        text: '退出',
        icon: <SvgIcon.Logout />,
        onClick: async () => {
          await logout()
          USER_INFO.remove()
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
  }, [navigate, shutdown, logout])

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
    const hasRunning = runningAppList.map(o => o.id).includes(appId)
    const { target, clientX, clientY } = event
    const eventData = { target, clientX, clientY }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.Add />,
        label: hasRunning ? '新建窗口' : '打开',
        isShow: !hasRunning || app.multiple,
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
            {userInfo ? (
              <img
                alt={userInfo.nickname}
                src={FsApi.getAvatarStreamUrl(userInfo.username)}
                className="rounded-full border border-white"
              />
            ) : (
              <SvgIcon.G />
            )}
            <div className="absolute left-0 bottom-0 mb-6 bg-white-900 hidden group-hover:block">
              <div className="w-56 py-1 backdrop-filter backdrop-blur">
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
        <div className="w-32"></div>
      </div>
    </>
  )
}
