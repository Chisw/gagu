import { Dropdown } from '@douyinfe/semi-ui'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { rootInfoState, userInfoState } from '../../states'
import { IRootInfo } from '../../types'
import { DOCUMENT_TITLE, line, PULSE_INTERVAL, USER_INFO } from '../../utils'
import TransferPanel from './TransferPanel'

export default function MenuBar() {

  const navigate = useNavigate()

  const [isEffected, setIsEffected] = useState(false)
  const [timeStr, setTimerStr] = useState('----/--/-- 周- --:--')
  const [systemPopoverShow, setSystemPopoverShow] = useState(false)
  const [userPopoverShow, setUserPopoverShow] = useState(false)

  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)

  const { fetch: pulse } = useFetch(AuthApi.pulse)
  const { fetch: logout } = useFetch(AuthApi.logout)
  const { fetch: getRootInfo, loading, data } = useFetch(FsApi.getRootInfo)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)

  useEffect(() => {
    setTimeout(() => setIsEffected(true))
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

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      // const str = now.toFormat('yyyy/MM/dd HH:mm ccc')
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
                <div className="mb-2px px-4 pb-1 border-b text-xs font-din">
                  GAGU Version {rootInfo.version}
                </div>
                <Dropdown.Item
                  icon={<SvgIcon.Fullscreen />}
                  onClick={() => {
                    setSystemPopoverShow(false)
                    document.querySelector('html')?.requestFullscreen()
                  }}
                >
                  进入全屏
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
              <span className="ml-2 text-gray-600 font-din">
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
                <div className="mb-2px px-4 pt-2 pb-1 border-b">
                  <div className="flex items-center">
                    <img
                      alt={userInfo?.nickname}
                      src={FsApi.getAvatarStreamUrl(userInfo?.username || '')}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-2 text-sm">
                      <p>{userInfo?.nickname}</p>
                      <p className="text-xs text-gray-500">@{userInfo?.username}</p>
                    </div>
                  </div>
                  <div className="mt-2 font-din capitalize text-xs">{userInfo?.permissionList.join(' ')}</div>
                </div>
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
                  <img
                    alt={userInfo.nickname}
                    src={FsApi.getAvatarStreamUrl(userInfo.username)}
                    className="w-3 h-3 rounded-full filter grayscale"
                  />
                  <span className="ml-1 font-din">{userInfo.nickname}</span>
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
    </>
  )
}
