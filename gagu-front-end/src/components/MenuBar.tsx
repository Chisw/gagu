import { useCallback, useEffect, useMemo, useState } from 'react'
import { TransferPanel, MySharingPanel } from '.'
import { Dropdown, Modal, Tooltip } from '@douyinfe/semi-ui'
import { DateTime } from 'luxon'
import { useNavigate } from 'react-router-dom'
import { AuthApi, FsApi } from '../api'
import { SvgIcon } from './common'
import { useRequest } from '../hooks'
import { DOCUMENT_TITLE, line, PULSE_INTERVAL, UserInfoStore } from '../utils'
import QrCode from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { Page } from '../types'
import { useRecoilState } from 'recoil'
import { activePageState, baseDataState, runningAppListState, userInfoState } from '../states'
import toast from 'react-hot-toast'

const pageList = [
  { key: Page.desktop, icon: <SvgIcon.Desktop /> },
  { key: Page.explore, icon: <SvgIcon.Layout /> },
  { key: Page.touch, icon: <SvgIcon.Phone /> },
]

export function MenuBar() {

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [baseData, setBaseData] = useRecoilState(baseDataState)
  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [, setRunningAppList] = useRecoilState(runningAppListState)

  const [clockTime, setClockTime] = useState('--:--')
  const [systemPopoverShow, setSystemPopoverShow] = useState(false)
  const [userPopoverShow, setUserPopoverShow] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [passwordModalShow, setPasswordModalShow] = useState(false)
  const [sharingPanelShow, setSharingPanelShow] = useState(false)

  const { request: pulse } = useRequest(AuthApi.pulse)
  const { request: logout } = useRequest(AuthApi.logout)
  const { request: queryBaseData, loading } = useRequest(FsApi.queryBaseData)
  const { request: shutdown } = useRequest(AuthApi.shutdown)

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
      const { success, message, userInfo } = await pulse()
      if (success) {
        setUserInfo(userInfo)
        UserInfoStore.set(userInfo)
      } else {
        toast.error(message)
      }
    }, PULSE_INTERVAL)
    return () => clearInterval(timer)
  }, [pulse, setUserInfo])

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

  const localAddress = useMemo(() => {
    const { protocol, port } = window.location
    return `${protocol}//${baseData.serverOS.host}:${port}/touch`
  }, [baseData])

  const handleLogout = useCallback(async () => {
    setUserPopoverShow(false)
    await logout()
    UserInfoStore.remove()
    setActivePage(Page.PENDING)
    setTimeout(() => navigate('/login'), 500)
  }, [logout, navigate, setActivePage])

  return (
    <>
      <div
        className={line(`
          gagu-menu-bar
          absolute z-20 top-0 right-0 left-0
          px-1 h-6
          flex justify-between items-center
           bg-white bg-opacity-50 shadow-sm backdrop-blur
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
                    GAGU v{baseData.version}
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
                    handleQueryBaseData()
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
                      {pageList.filter(m => m.key !== activePage).map(({ key, icon }) => (
                        <Dropdown.Item
                          key={key}
                          icon={icon}
                          onClick={() => {
                            setActivePage(Page.PENDING)
                            setRunningAppList([])
                            setTimeout(() => navigate(`/${key}`), 500)
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
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10 select-none"
              onClick={() => setSystemPopoverShow(true)}
            >
              <SvgIcon.G size={12} />
              <span className="hidden md:inline ml-2 text-gray-700 font-din">
                {/* TODO: i18n */}
                {loading ? 'Loading..' : `${baseData.deviceName}`}
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
                    setSharingPanelShow(true)
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
              className="px-2 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10 select-none"
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
          {clockTime}
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

      <MySharingPanel
        visible={sharingPanelShow}
        onClose={() => setSharingPanelShow(false)}
      />
    </>
  )
}
