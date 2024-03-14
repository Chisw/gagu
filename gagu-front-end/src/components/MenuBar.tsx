import { useCallback, useEffect, useMemo, useState } from 'react'
import { UploadPanel, MySharingPanel, ChangePasswordModal, ClipboardPanel, LoginManagementPanel } from '.'
import { Dropdown } from '@douyinfe/semi-ui'
import { DateTime } from 'luxon'
import { useNavigate } from 'react-router-dom'
import { AuthApi, FsApi, SettingApi } from '../api'
import { SvgIcon } from './common'
import { useRequest, useUserConfig } from '../hooks'
import { DOCUMENT_TITLE, EntryPathCacheStore, getDefaultUserConfig, line, UserInfoStore } from '../utils'
import QrCode from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { Page } from '../types'
import { useRecoilState } from 'recoil'
import { activePageState, baseDataState, contextMenuDataState, runningAppListState, userInfoState } from '../states'

const pageList = [
  { key: Page.desktop, icon: <SvgIcon.Desktop /> },
  { key: Page.explore, icon: <SvgIcon.Layout /> },
  { key: Page.touch, icon: <SvgIcon.Phone /> },
]

export const getMenuBarHeight = () => document.querySelector('.gagu-menu-bar')?.scrollHeight || 24

export function MenuBar() {

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [baseData, setBaseData] = useRecoilState(baseDataState)
  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [, setRunningAppList] = useRecoilState(runningAppListState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const { setUserConfig } = useUserConfig()

  const [clockTime, setClockTime] = useState('--:--')
  const [systemPopoverShow, setSystemPopoverShow] = useState(false)
  const [userPopoverShow, setUserPopoverShow] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [sharingPanelShow, setSharingPanelShow] = useState(false)
  const [loginManagementPanelShow, setLoginManagementPanelShow] = useState(false)
  const [changePasswordModalShow, setChangePasswordModalShow] = useState(false)

  const { request: logout } = useRequest(AuthApi.logout)
  const { request: queryBaseData, loading } = useRequest(FsApi.queryBaseData)
  const { request: shutdown } = useRequest(SettingApi.shutdown)

  const avatarStyle = useMemo(() => {
    return userInfo
      ? {
        backgroundImage: `url("${FsApi.getPublicAvatarStreamUrl(userInfo.username || '')}")`
      }
      : undefined
  }, [userInfo])

  const localAddress = useMemo(() => {
    const { protocol, port } = window.location
    return `${protocol}//${baseData.serverOS.host}:${port}/login`
  }, [baseData])

  const handleLogout = useCallback(async () => {
    setUserPopoverShow(false)
    const { success } = await logout()
    if (success) {
      UserInfoStore.remove()
      EntryPathCacheStore.remove()
      setUserConfig(getDefaultUserConfig())
      setRunningAppList([])
      setContextMenuData(null)
      setActivePage(Page.PENDING)
      setTimeout(() => navigate('/login'), 500)
    }
  }, [logout, navigate, setActivePage, setContextMenuData, setRunningAppList, setUserConfig])

  const handleSwitchMode = useCallback((key: string) => {
    setRunningAppList([])
    setContextMenuData(null)
    setActivePage(Page.PENDING)
    setTimeout(() => navigate(`/${key}`), 500)
  }, [navigate, setActivePage, setContextMenuData, setRunningAppList])

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
    document.title = `${baseData ? `${baseData.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [baseData])

  useEffect(() => {
    if (systemPopoverShow) {
      setIsFullScreen(document.fullscreen)
    }
  }, [systemPopoverShow])

  useEffect(() => {
    const tick = () => setClockTime(DateTime.local().toFormat('HH:mm'))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleQueryBaseData = useCallback(async () => {
    const { success, data } = await queryBaseData()
    if (success) {
      setBaseData(data)
    }
  }, [queryBaseData, setBaseData])

  useEffect(() => {
    handleQueryBaseData()
  }, [handleQueryBaseData])

  return (
    <>
      <div
        className={line(`
          gagu-menu-bar
          absolute z-20 top-0 right-0 left-0
          px-1 h-8 md:h-6 shadow-sm backdrop-blur
          flex justify-between items-center
           bg-white bg-opacity-60
           dark:bg-zinc-700 dark:bg-opacity-80 dark:text-zinc-200
          transition-all duration-500 ease-out
          ${[Page.desktop, Page.explore, Page.touch].includes(activePage) ? 'translate-y-0' : '-translate-y-20'}
        `)}
      >
        <div className="h-full flex items-center text-xs">
          <Dropdown
            trigger="click"
            position="bottomLeft"
            className="bg-white bg-opacity-80 backdrop-blur dark:bg-zinc-700 dark:bg-opacity-80"
            visible={systemPopoverShow}
            render={(
              <Dropdown.Menu className="w-48">
                <div className="mb-[2px] px-2 pb-1 border-b text-xs font-din flex justify-between dark:text-zinc-200 dark:border-black dark:border-opacity-20">
                  <div>
                    GAGU v{baseData.version}
                  </div>
                  <div className="flex">
                    <a
                      title={t`action.visitWebsite`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-300 hover:text-gray-500 dark:hover:text-zinc-100"
                      href="https://gagu.io"
                    >
                      <SvgIcon.Earth />
                    </a>
                    <a
                      title={t`action.visitGithub`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-gray-300 hover:text-gray-500 dark:hover:text-zinc-100"
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
                    handleQueryBaseData()
                  }}
                >
                  {t`action.refresh`}
                </Dropdown.Item>
                <Dropdown
                  position="rightTop"
                  className="bg-white bg-opacity-80 backdrop-blur dark:bg-zinc-700 dark:bg-opacity-80"
                  render={(
                    <div className="px-4 py-8 w-48 dark:text-zinc-200">
                      <div className="flex justify-center">
                        <QrCode value={localAddress} className="border-2 border-white" />
                      </div>
                      <p className="mt-2 text-xs text-center font-din">{localAddress}</p>
                    </div>
                  )}
                >
                  <Dropdown.Item
                    icon={<SvgIcon.QrCode />}
                  >
                    <div className="w-full flex justify-between items-center">
                      <span>{t`action.qrCode`}</span>
                      <SvgIcon.ChevronRight className="text-gray-400 dark:text-zinc-200"/>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown
                  showTick
                  position="rightTop"
                  className="bg-white bg-opacity-80 backdrop-blur dark:bg-zinc-700 dark:bg-opacity-80"
                  render={(
                    <Dropdown.Menu className="w-48">
                      {pageList.map(({ key, icon }) => {
                        const isActive = key === activePage
                        return (
                          <Dropdown.Item
                            key={key}
                            icon={icon}
                            active={isActive}
                            disabled={isActive}
                            className="relative"
                          >
                            <span className="capitalize">{key}</span>&nbsp;{t`label.mode`}
                            <div
                              className="absolute inset-0"
                              onMouseDown={() => !isActive && handleSwitchMode(key)}
                              onTouchStart={() => !isActive && handleSwitchMode(key)}
                            />
                          </Dropdown.Item>
                        )
                      })}
                    </Dropdown.Menu>
                  )}
                >
                  <Dropdown.Item icon={<SvgIcon.Device />}>
                    <div className="w-full flex justify-between items-center">
                      <span>{t`action.switchTo`}</span>
                      <SvgIcon.ChevronRight className="text-gray-400 dark:text-zinc-200"/>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown.Item
                  icon={<SvgIcon.Power className="text-red-500" />}
                  onClick={() => {
                    shutdown()
                    window.open('', '_self')?.close()
                  }}
                >
                  {t`action.shutdown`}
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <div
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10 select-none"
              onClick={() => setSystemPopoverShow(true)}
            >
              <SvgIcon.G size={12} className="hidden md:block" />
              <SvgIcon.G size={14} className="block md:hidden" />
              <span className="hidden md:inline ml-2 text-gray-700 font-din dark:text-zinc-200">
                {loading ? t`tip.loading` : `${baseData.deviceName}`}
              </span>
            </div>
          </Dropdown>
          <Dropdown
            trigger="click"
            position="bottomLeft"
            className="bg-white bg-opacity-80 backdrop-blur dark:bg-zinc-700 dark:bg-opacity-80"
            visible={userPopoverShow}
            render={(
              <Dropdown.Menu className="w-48">
                <div className="mb-[2px] px-2 pt-1 pb-2 border-b dark:border-black dark:border-opacity-20">
                  <div className="flex items-center">
                    <div
                      className="gagu-user-avatar w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover dark:border-zinc-400"
                      style={avatarStyle}
                    />
                    <div className="ml-2 text-sm leading-none flex-grow">
                      <p className="font-bold dark:text-zinc-100">{userInfo?.nickname}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-300">@{userInfo?.username}</p>
                    </div>
                  </div>
                  <div className="mt-1 font-din">
                    {userInfo?.permissions.map(p => (
                      <span
                        key={p}
                        className={line(`
                          inline-block mr-[1px] px-1 py-0
                          text-xs text-blue-600 bg-blue-100 rounded select-none capitalize
                          dark:text-blue-200 dark:bg-blue-600
                        `)}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <Dropdown.Item
                  icon={<SvgIcon.Share />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setSharingPanelShow(true)
                  }}
                >
                  {t`action.mySharing`}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.LoginManagement />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setLoginManagementPanelShow(true)
                  }}
                >
                  {t`action.loginManagement`}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<SvgIcon.Key />}
                  onClick={() => {
                    setUserPopoverShow(false)
                    setTimeout(() => setChangePasswordModalShow(true))
                  }}
                >
                  {t`action.changePassword`}
                </Dropdown.Item>
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
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10 select-none"
              onClick={() => setUserPopoverShow(true)}
            >
              {userInfo ? (
                <>
                  <div
                    className="gagu-user-avatar w-4 h-4 md:w-3 md:h-3 md:box-content rounded-full filter opacity-80 bg-center bg-cover bg-black bg-opacity-20 border border-white dark:border-zinc-200"
                    style={avatarStyle}
                  />
                  <span className="hidden md:inline ml-2 font-din text-gray-700 dark:text-zinc-200">{userInfo.nickname}</span>
                </>
              ) : (
                <SvgIcon.Users />
              )}
            </div>
          </Dropdown>
        </div>
        <div className="h-full flex justify-end items-center">
          <ClipboardPanel />
          <UploadPanel />
          <span className="px-2 flex-shrink-0 text-xs leading-none font-din select-none">
            {clockTime}
          </span>
        </div>
      </div>

      <MySharingPanel
        show={sharingPanelShow}
        onClose={() => setSharingPanelShow(false)}
      />

      <LoginManagementPanel
        show={loginManagementPanelShow}
        onClose={() => setLoginManagementPanelShow(false)}
      />

      <ChangePasswordModal
        show={changePasswordModalShow}
        onClose={() => setChangePasswordModalShow(false)}
      />
    </>
  )
}
