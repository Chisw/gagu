import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { rootInfoState } from '../../states'
import { IRootInfo } from '../../types'
import { DOCUMENT_TITLE, line } from '../../utils'
import TransferAssistant from './TransferAssistant'

export default function MenuBar() {

  const [isEffected, setIsEffected] = useState(false)
  const [timeStr, setTimerStr] = useState('----/--/-- 周- --:--')

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)

  const { fetch: getRootInfo, loading, data } = useFetch(FsApi.getRootInfo)

  useEffect(() => {
    setIsEffected(true)
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      const str = now.toFormat('yyyy/MM/dd HH:mm ccc')
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
          px-3 h-6
          flex justify-between items-center
          border-b border-gray-500 border-opacity-20
           bg-white-600
          backdrop-filter backdrop-blur
          transition-all duration-500
          transform
          ${isEffected ? 'translate-y-0' : '-translate-y-20'}
        `)}
      >
        <div className="w-1/3 flex items-center text-xs group">
          <SvgIcon.G size={12} />
          <span className="ml-3 text-gray-600 font-din">GAGU v{rootInfo.version}</span>
          <span className="ml-3 text-gray-600">{loading ? '系统加载中' : `${rootInfo.deviceName} [${rootInfo.platform}]`}</span>
          <span
            title="刷新系统"
            className="ml-3 hidden group-hover:block cursor-pointer"
            onClick={() => getRootInfo()}
          >
            <SvgIcon.Refresh size={12} />
          </span>
        </div>
        <div className="w-1/3  flex-shrink-0 text-center text-xs leading-none font-din">
          {timeStr}
        </div>
        <div className="w-1/3 h-full flex justify-end">
          <TransferAssistant />
        </div>
      </div>
    </>
  )
}
