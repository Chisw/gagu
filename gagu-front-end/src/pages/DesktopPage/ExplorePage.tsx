import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { AuthApi, FsApi } from '../../api'
import FileExplorer from '../../apps/FileExplorer'
import { useFetch } from '../../hooks'
import { rootInfoState, userInfoState } from '../../states'
import { IRootInfo } from '../../types'
import { PULSE_INTERVAL, USER_INFO } from '../../utils'
import ContextMenu from './ContextMenu'
import MenuBar from './MenuBar'

export default function ExplorePage() {
  
  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)

  const { fetch: pulse } = useFetch(AuthApi.pulse)
  const { fetch: logout } = useFetch(AuthApi.logout)
  const { fetch: getRootInfo, loading, data } = useFetch(FsApi.getRootInfo)
  const { fetch: shutdown } = useFetch(AuthApi.shutdown)

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
    getRootInfo()
  }, [getRootInfo])

  useEffect(() => {
    if (data) {
      setRootInfo(data.rootInfo as IRootInfo)
    }
  }, [data, setRootInfo])

  return (
    <>
      <div
        className="fixed z-0 inset-0 bg-gray-200"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <MenuBar />
        <div className="absolute z-0 inset-0 mt-6 border-t">
          <FileExplorer
            isTopWindow={true}
            setWindowLoading={() => {}}
            setWindowTitle={() => {}}
            windowSize={{ width: 1080, height: 1920 }}
          />
        </div>
        <ContextMenu />
      </div>
    </>
  )
}
