import { Button, Input, Tooltip } from '@douyinfe/semi-ui'
import { Duration } from 'luxon'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { DownloadApi, FsApi, TunnelApi } from '../api'
import { Spinner, SvgIcon } from '../components/base'
import EntryListPanel from '../components/EntryListPanel'
import { useFetch } from '../hooks'
import { getDateTime, SERVER_MESSAGE_MAP } from '../utils'

export default function SharePage() {

  const { code } = useParams()

  const [passwordVal, setPasswordVal] = useState('')
  const [expiredAtTip, setExpiredAtTip] = useState('')

  const { fetch: getTunnel, loading, data } = useFetch(TunnelApi.getTunnel)
  const { fetch: checkTunnel, loading: calling } = useFetch(TunnelApi.checkTunnel)

  const updateTunnelData = useCallback(() => {
    if (code) {
      getTunnel(code, passwordVal)
    }
  }, [code, getTunnel, passwordVal])

  useEffect(() => {
    updateTunnelData()
    document.title = 'Share - GAGU.IO'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    isSuccess,
    isShowInput,
    isShowError,
    message,
    flattenList,
    entryList,
    username,
    nickname,
    createdAt,
    expiredAt,
    leftTimes,
    downloadName,
  } = useMemo(() => {
    const {
      flattenList,
      success,
      message,
    } = data || {}
    const {
      entryList,
      username,
      nickname,
      createdAt,
      expiredAt,
      leftTimes,
      downloadName,
    } = data?.tunnel || {}

    const isSuccess = success
    const isShowInput = success && message === SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_NEEDED
    const isShowError = !success

    return {
      isSuccess,
      isShowInput,
      isShowError,
      message,
      flattenList: flattenList || [],
      entryList: entryList || [],
      username: username || '',
      nickname,
      createdAt,
      expiredAt,
      leftTimes,
      downloadName,
    }
  }, [data])

  useEffect(() => {
    const tick = () => {
      let tip = '无限期'
      if (expiredAt !== undefined) {
        const restMillis = expiredAt - Date.now()
        if (restMillis > 0) {
          const { months, days, hours, minutes } = Duration.fromMillis(restMillis).shiftTo('month', 'day', 'hour', 'minute').toObject()
          tip = [
            { unit: '个月', count: months },
            { unit: '天', count: days },
            { unit: '小时', count: hours },
            { unit: '分钟', count: minutes? Math.floor(minutes) : 0 },
          ]
            .map(({ unit, count }) => count ? `${count} ${unit}` : '')
            .filter(Boolean)
            .slice(0, 2)
            .join(' ')
        } else {
          tip = '已过期'
        }
      }
      setExpiredAtTip(tip)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiredAt])

  const disabled = useMemo(() => {
    const isNoLeft = leftTimes === 0
    const isExpired = !!(expiredAt && expiredAt < Date.now())
    const disabled = isNoLeft || isExpired || isShowInput
    return disabled
  }, [expiredAt, leftTimes, isShowInput])

  const handleDownloadClick = useCallback(async () => {
    if (code) {
      const res = await checkTunnel(code, passwordVal)
      if (res && res.success) {
        DownloadApi.download(code, passwordVal)
        setTimeout(() => {
          getTunnel(code, passwordVal)
        }, 50)
      } else {
        toast.error(res?.message || 'ERROR')
      }
    }
  }, [code, passwordVal, checkTunnel, getTunnel])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-gradient-to-b from-gray-600 to-gray-400 flex justify-center items-center">
        <div className="relative m-4 md:m-0 px-4 md:px-10 py-8 w-full md:w-160 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute z-0 top-0 right-0 -mt-16 -mr-16">
            <SvgIcon.Share className="text-gray-100" size={320} />
          </div>
          {isSuccess && (
            <div className="relative z-10">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover flex-shrink-0"
                  style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}")` }}
                />
                <div className="ml-4 flex-grow">
                  <p className="text-sm md:text-base">{nickname} 的分享</p>
                  <p className="flex justify-between text-xs text-gray-500">
                    {createdAt && getDateTime(createdAt).slice(0, -3)}
                  </p>
                </div>
              </div>
              {isShowInput ? (
                <div className="my-6 px-8 py-16 border backdrop-filter backdrop-blur-sm">
                  <p className="text-sm text-gray-500 text-center">啊喔，分享者设置了访问密码</p>
                  <div className="mt-4 flex justify-center">
                    <Input
                      autofocus
                      showClear
                      placeholder="请输入访问密码"
                      className="w-48"
                      type="password"
                      value={passwordVal}
                      onChange={setPasswordVal}
                    />
                      <Button
                        type="primary"
                        theme="solid"
                        className="ml-2 w-24"
                        disabled={!passwordVal}
                        loading={loading}
                        onClick={updateTunnelData}
                      >
                        确定
                      </Button>
                  </div>
                </div>
              ) : (
                <EntryListPanel
                  downloadName={downloadName || ''}
                  entryList={entryList}
                  flattenList={flattenList}
                />
              )}
              {code && (
                <div className="flex flex-wrap justify-between items-center">
                  <div className="w-full md:w-auto text-center md:text-left text-xs text-gray-500">
                    <p>剩余保存次数：{leftTimes === undefined ? '无限次' : leftTimes}</p>
                    <p>
                      <span className="mr-1">剩余有效期：{expiredAtTip}</span>
                      <Tooltip
                        position="right"
                        className="text-xs"
                        content={expiredAt ? `有效期至：${getDateTime(expiredAt).slice(0, -3)}` : undefined}
                      >
                        <span><SvgIcon.Info className="-mt-2px inline text-gray-300" size={14} /></span>
                      </Tooltip>
                    </p>
                  </div>
                  <div className="mt-4 mx-auto md:m-0 w-full md:w-auto flex justify-center">
                    <Button
                      size="large"
                      type="primary"
                      theme="solid"
                      className="w-36 md:w-auto"
                      loading={calling}
                      disabled={disabled}
                      icon={<SvgIcon.Download />}
                      onClick={handleDownloadClick}
                    >
                      保存至本地
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isShowError && (
            <div className="relative z-10 py-12 font-din">
              <SvgIcon.G className="mx-auto text-gray-800" size={32} />
              <p className="mt-8 text-center text-gray-400">{message}</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner size={30} />
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 py-4 w-full text-center text-xs">
        <a
          rel="noreferrer"
          href="https://gagu.io"
          target="_blank"
          className="opacity-30 hover:opacity-70"
        >
          GAGU.IO
        </a>
      </div>
    </>
  )
}