import { Dropdown, Modal, Tooltip } from '@douyinfe/semi-ui'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useRequest } from '../../hooks'
import { activePageState, rootInfoState, userInfoState } from '../../states'
import { DOCUMENT_TITLE, line, PULSE_INTERVAL, UserInfoStore } from '../../utils'
import QrCode from 'qrcode.react'
import TransferPanel from './TransferPanel'
import MySharePanel from '../../components/MySharePanel'
import { useTranslation } from 'react-i18next'
import { Page } from '../../types'

const modeList = [
  { key: Page.desktop, icon: <SvgIcon.Desktop /> },
  { key: Page.explore, icon: <SvgIcon.Layout /> },
  { key: Page.touch, icon: <SvgIcon.Phone /> },
]

export default function MenuBar() {

  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const [timeStr, setTimerStr] = useState('--:--')
  const [systemPopoverShow, setSystemPopoverShow] = useState(false)
  const [userPopoverShow, setUserPopoverShow] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [passwordModalShow, setPasswordModalShow] = useState(false)
  const [shareVisible, setShareVisible] = useState(false)

  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [activePage, setActivePage] = useRecoilState(activePageState)

  const { request: pulse } = useRequest(AuthApi.pulse)
  const { request: logout } = useRequest(AuthApi.logout)
  const { request: queryRootInfo, loading } = useRequest(FsApi.queryRootInfo)
  const { request: shutdown } = useRequest(AuthApi.shutdown)

  const activeMode = useMemo(() => {
    if (pathname.startsWith('/explore')) {
      return Page.explore
    } else if (pathname.startsWith('/touch')) {
      return Page.touch
    } else {
      return Page.desktop
    }
  }, [pathname])

  useEffect(() => {
    if (systemPopoverShow) {
      setIsFullScreen(document.fullscreen)
    }
  }, [systemPopoverShow])

  useEffect(() => {
    if (!userInfo) {
      const info = UserInfoStore.get()
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
        UserInfoStore.set(res.userInfo)
      } else {
        toast.error(res.message)
      }
    }, PULSE_INTERVAL)
    return () => clearInterval(timer)
  }, [pulse, setUserInfo])

  useEffect(() => {
    const tick = () => setTimerStr(DateTime.local().toFormat('HH:mm'))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleQueryRootInfo = useCallback(async () => {
    const { success, data } = await queryRootInfo()
    if (success) {
      setRootInfo(data)
    }
  }, [queryRootInfo, setRootInfo])

  useEffect(() => {
    handleQueryRootInfo()
  }, [handleQueryRootInfo])

  useEffect(() => {
    document.title = `${rootInfo ? `${rootInfo.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [rootInfo])

  const localAddress = useMemo(() => {
    const { protocol, port } = window.location
    return `${protocol}//${rootInfo.serverOS.host}:${port}/touch`
  }, [rootInfo])

  const handleLogout = useCallback(async () => {
    setUserPopoverShow(false)
    await logout()
    UserInfoStore.remove()
    setActivePage(Page.PENDING)
    setTimeout(() => {
      navigate('/login')
    }, 500)
  }, [logout, navigate, setActivePage])

  return (
    <>
      <div
        className={line(`
          gagu-menu-bar
          absolute z-20 top-0 right-0 left-0
          px-1 h-6
          flex justify-between items-center
           bg-white bg-opacity-50 shadow-sm
          backdrop-filter backdrop-blur
          transition-all duration-500 ease-out
          ${[Page.desktop, Page.explore, Page.touch].includes(activePage) ? 'translate-y-0' : '-translate-y-20'}
        `)}
      >
        <div className="w-1/3 h-full flex items-center text-xs">
          <Dropdown
            trigger="click"
            position="bottomLeft"
            visible={systemPopoverShow}
            render={(
              <Dropdown.Menu className="w-48">
                <div className="mb-[2px] px-2 pb-1 border-b text-xs font-din flex justify-between">
                  <div>
                    GAGU v{rootInfo.version}
                  </div>
                  <div className="flex">
                    <a
                      title={t`action.visitWebsite`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-300 hover:text-gray-500"
                      href="https://gagu.io"
                    >
                      <SvgIcon.Earth />
                    </a>
                    <a
                      title={t`action.visitGithub`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-gray-300 hover:text-gray-500"
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
                  {isFullScreen ? t`action.fullScreenExit` : t`action.fullScreenEnter`}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.Refresh />}
                  onClick={() => {
                    setSystemPopoverShow(false)
                    handleQueryRootInfo()
                  }}
                >
                  {t`action.refresh`}
                </Dropdown.Item>
                <Dropdown
                  position="rightTop"
                  render={(
                    <div className="px-4 py-8 w-48">
                      <div className="flex justify-center">
                        <QrCode value={localAddress} />
                      </div>
                      <p className="mt-2 text-xs text-center font-din">{localAddress}</p>
                    </div>
                  )}
                >
                  <Dropdown.Item icon={<SvgIcon.QrCode />}>
                    <div className="w-full flex justify-between items-center">
                      <span>{t`action.qrCode`}</span>
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
                          onClick={() => {
                            setActivePage(Page.PENDING)
                            navigate(`/${key}`)
                          }}
                        >
                          <span className="capitalize">{key}</span>&nbsp;{t`label.mode`}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  )}
                >
                  <Dropdown.Item icon={<SvgIcon.Device />}>
                    <div className="w-full flex justify-between items-center">
                      <span>{t`action.switchTo`}</span>
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
                  {t`action.shutdown`}
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <div
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10"
              onClick={() => setSystemPopoverShow(true)}
            >
              <SvgIcon.G size={12} />
              <span className="hidden md:inline ml-2 text-gray-700 font-din">
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
                <div className="mb-[2px] px-2 pt-1 pb-2 border-b group">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover"
                      style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(userInfo?.username || '')}")` }}
                    />
                    <div className="ml-2 text-sm leading-none flex-grow">
                      <p>{userInfo?.nickname}</p>
                      <p className="text-xs text-gray-500">@{userInfo?.username}</p>
                    </div>
                    <div className="hidden group-hover:block">
                      <Tooltip
                        position="right"
                        content={(
                          <div className="font-din capitalize text-white font-din">
                            Permissions: {userInfo?.permissions.join(' ')}
                          </div>
                        )}
                      >
                        <span>
                          <SvgIcon.Info className="text-gray-400" />
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Dropdown.Item
                  icon={<SvgIcon.Share />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setShareVisible(true)
                  }}
                >
                  {t`action.mySharing`}
                </Dropdown.Item>
                {/* <Dropdown.Item
                  icon={<SvgIcon.Key />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setTimeout(() => setPasswordModalShow(true))
                  }}
                >
                  {t`action.changePassword`}
                </Dropdown.Item> */}
                <Dropdown.Item
                  icon={<SvgIcon.Logout />}
                  onClick={handleLogout}
                >
                  {t`action.logout`}
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <div
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10"
              onClick={() => setUserPopoverShow(true)}
            >
              {userInfo ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full filter grayscale opacity-80 bg-center bg-cover bg-black bg-opacity-20"
                    style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(userInfo?.username || '')}")` }}
                  />
                  <span className="hidden md:inline ml-2 font-din text-gray-700">{userInfo.nickname}</span>
                </>
              ) : (
                <SvgIcon.User />
              )}
            </div>
          </Dropdown>
        </div>
        <div className="w-1/3 flex-shrink-0 text-center text-xs leading-none font-din select-none">
          {timeStr}
        </div>
        <div className="w-1/3 h-full flex justify-end">
          <TransferPanel />
        </div>
      </div>

      <Modal
        title={t`title.changePassword`}
        visible={passwordModalShow}
        onCancel={() => setPasswordModalShow(false)}
      >
        
      </Modal>

      <MySharePanel visible={shareVisible} onClose={() => setShareVisible(false)} />
    </>
  )
}
