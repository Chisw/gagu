import { Dropdown, Modal } from '@douyinfe/semi-ui'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { rootInfoState, userInfoState } from '../../states'
import { IRootInfo } from '../../types'
import { DOCUMENT_TITLE, line, PULSE_INTERVAL, USER_INFO } from '../../utils'
import TransferPanel from './TransferPanel'
import QrCode from 'qrcode.react'

const modeList = [
  { key: 'desktop', icon: <SvgIcon.Desktop /> },
  { key: 'explore', icon: <SvgIcon.Layout /> },
  { key: 'touch', icon: <SvgIcon.Phone /> },
]

export default function MenuBar() {

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [isEffected, setIsEffected] = useState(false)
  const [timeStr, setTimerStr] = useState('--:--')
  const [systemPopoverShow, setSystemPopoverShow] = useState(false)
  const [userPopoverShow, setUserPopoverShow] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [passwordModalShow, setPasswordModalShow] = useState(false)

  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)

  const { fetch: pulse } = useFetch(AuthApi.pulse)
  const { fetch: logout } = useFetch(AuthApi.logout)
  const { fetch: getRootInfo, loading, data } = useFetch(FsApi.getRootInfo)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)

  const activeMode = useMemo(() => {
    if (pathname.startsWith('/explore')) {
      return 'explore'
    } else if (pathname.startsWith('/touch')) {
      return 'touch'
    } else {
      return 'desktop'
    }
  }, [pathname])

  useEffect(() => {
    setTimeout(() => setIsEffected(true))
  }, [])

  useEffect(() => {
    if (systemPopoverShow) {
      setIsFullScreen(document.fullscreen)
    }
  }, [systemPopoverShow])

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

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      const str = now.toFormat('HH:mm')
      setTimerStr(str)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    getRootInfo()
  }, [getRootInfo])

  useEffect(() => {
    if (data) {
      setRootInfo(data.rootInfo as IRootInfo)
    }
  }, [data, setRootInfo])

  useEffect(() => {
    document.title = `${rootInfo ? `${rootInfo.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [rootInfo])

  const localAddress = useMemo(() => {
    const { protocol, port } = window.location
    return `${protocol}//${rootInfo.serverOS.host}:${port}`
  }, [rootInfo])

  return (
    <>
      <div
        className={line(`
          gg-menu-bar
          absolute z-20 top-0 right-0 left-0
          px-1 h-6
          flex justify-between items-center
           bg-white-600 shadow-sm
          backdrop-filter backdrop-blur
          transition-all duration-500
          transform
          ${isEffected ? 'translate-y-0' : '-translate-y-20'}
        `)}
      >
        <div className="w-1/3 h-full flex items-center text-xs">
          <Dropdown
            trigger="click"
            position="bottomLeft"
            visible={systemPopoverShow}
            render={(
              <Dropdown.Menu className="w-48">
                <div className="mb-2px px-2 pb-1 border-b text-xs font-din flex justify-between">
                  <div>
                    GAGU v{rootInfo.version}
                  </div>
                  <div className="flex">
                    <a
                      title="访问网站"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                      href="https://gagu.io"
                    >
                      <SvgIcon.Earth />
                    </a>
                    <a
                      title="代码仓库"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-gray-400 hover:text-blue-600"
                      href="https://github.com/Chisw/gagu"
                    >
                      <SvgIcon.Github />
                    </a>
                  </div>
                </div>
                <Dropdown.Item
                  icon={isFullScreen ? <SvgIcon.FullscreenExit /> : <SvgIcon.Fullscreen />}
                  onClick={() => {
                    setSystemPopoverShow(false)
                    if (isFullScreen) {
                      document.exitFullscreen()
                    } else {
                      document.querySelector('html')?.requestFullscreen()
                    }
                  }}
                >
                  {isFullScreen ? '退出全屏' : '进入全屏'}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.Refresh />}
                  onClick={() => {
                    setSystemPopoverShow(false)
                    getRootInfo()
                  }}
                >
                  刷新
                </Dropdown.Item>
                <Dropdown
                  position="rightTop"
                  render={(
                    <div className="p-4">
                      <div className="flex justify-center">
                        <QrCode value={localAddress} />
                      </div>
                      <p className="mt-2 text-xs text-center font-din">{localAddress}</p>
                    </div>
                  )}
                >
                  <Dropdown.Item icon={<SvgIcon.Scan />}>
                    <div className="w-full flex justify-between items-center">
                      <span>扫一扫</span>
                      <SvgIcon.ChevronRight className="text-gray-400"/>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown
                  position="rightTop"
                  render={(
                    <Dropdown.Menu className="w-48">
                      {modeList.filter(m => m.key !== activeMode).map(({ key, icon }) => (
                        <Dropdown.Item
                          key={key}
                          icon={icon}
                          onClick={() => navigate(`/${key}`)}
                        >
                          <span className="capitalize">{key}</span>&nbsp;模式
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  )}
                >
                  <Dropdown.Item icon={<SvgIcon.Flash />}>
                    <div className="w-full flex justify-between items-center">
                      <span>切换至</span>
                      <SvgIcon.ChevronRight className="text-gray-400"/>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown.Item
                  icon={<SvgIcon.ShutDown className="text-red-500" />}
                  onClick={() => {
                    shutdown()
                    window.close()
                  }}
                >
                  关闭系统
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <div
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white-300 active:bg-black-100"
              onClick={() => setSystemPopoverShow(true)}
            >
              <SvgIcon.G size={12} />
              <span className="ml-2 text-gray-700 font-din">
                {loading ? 'Loading..' : `${rootInfo.deviceName}`}
              </span>
            </div>
          </Dropdown>
          <Dropdown
            trigger="click"
            position="bottomLeft"
            visible={userPopoverShow}
            render={(
              <Dropdown.Menu className="w-48">
                <div className="mb-2px px-2 pt-1 pb-1 border-b">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover"
                      style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(userInfo?.username || '')}")` }}
                    />
                    <div className="ml-2 text-sm leading-none">
                      <p>{userInfo?.nickname}</p>
                      <p className="text-xs text-gray-500">@{userInfo?.username}</p>
                    </div>
                  </div>
                  <div className="mt-2 font-din capitalize text-white font-din flex">
                    {userInfo?.permissions.map((p) => (
                      <div key={p} className="mr-1 px-1 rounded text-xs text-blue-600 bg-blue-100">
                        {p}
                      </div>
                    ))}  
                  </div>
                </div>
                <Dropdown.Item
                  icon={<SvgIcon.Share />}
                  onClick={() => {
                    setUserPopoverShow(false)
                  }}
                >
                  我的分享
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.Key />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setTimeout(() => setPasswordModalShow(true))
                  }}
                >
                  修改密码
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.Logout />}
                  onClick={async () => {
                    await logout()
                    USER_INFO.remove()
                    navigate('/login')
                  }}
                >
                  退出登录
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <div
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white-300 active:bg-black-100"
              onClick={() => setUserPopoverShow(true)}
            >
              {userInfo ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full filter grayscale opacity-80 bg-center bg-cover bg-black-200"
                    style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(userInfo?.username || '')}")` }}
                  />
                  <span className="ml-1 font-din text-gray-700">{userInfo.nickname}</span>
                </>
              ) : (
                <SvgIcon.User />
              )}
            </div>
          </Dropdown>
        </div>
        <div className="w-1/3  flex-shrink-0 text-center text-xs leading-none font-din">
          {timeStr}
        </div>
        <div className="w-1/3 h-full flex justify-end">
          <TransferPanel />
        </div>
      </div>

      <Modal
        title="修改密码"
        visible={passwordModalShow}
        onCancel={() => setPasswordModalShow(false)}
      >

        
      </Modal>
    </>
  )
}
