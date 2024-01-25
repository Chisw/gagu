import { Button, Input, Popover, Tooltip } from '@douyinfe/semi-ui'
import { Duration } from 'luxon'
import { QRCodeCanvas } from 'qrcode.react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { FsApi, TunnelApi } from '../api'
import { EntryListPanel, PublicFooter, Spinner, SvgIcon } from '../components/common'
import { useRequest } from '../hooks'
import { copy, getDateTime, line } from '../utils'
import { useRecoilState } from 'recoil'
import { activePageState } from '../states'
import { Page, ServerMessage } from '../types'

const sharingUrl = window.location.href

export default function SharePage() {

  const { code } = useParams()
  const { t } = useTranslation()

  const [passwordVal, setPasswordVal] = useState('')
  const [expiredAtTip, setExpiredAtTip] = useState('')

  const [activePage, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.sharing))
  }, [setActivePage])

  const { request: queryTunnel, loading, response } = useRequest(TunnelApi.queryTunnel)
  const { request: queryTunnelCheck, loading: calling } = useRequest(TunnelApi.queryTunnelCheck)

  const updateTunnelData = useCallback(() => {
    if (code) {
      queryTunnel(code, passwordVal)
    }
  }, [code, queryTunnel, passwordVal])

  useEffect(() => {
    updateTunnelData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = `${t`title.page_sharing`} - GAGU.IO`
  }, [t])

  const {
    isSuccess,
    isShowInput,
    isShowError,
    message,
    flatList,
    entryList,
    username,
    nickname,
    createdAt,
    expiredAt,
    leftTimes,
    downloadName,
  } = useMemo(() => {
    const { success, message } = response || {}

    const {
      entryList,
      username,
      nickname,
      createdAt,
      expiredAt,
      leftTimes,
      downloadName,
    } = response?.data?.tunnel || {}

    const flatList = response?.data?.flatList || []
    const isSuccess = success
    const isShowInput = success && message === ServerMessage.ERROR_TUNNEL_PASSWORD_NEEDED
    const isShowError = !success

    return {
      isSuccess,
      isShowInput,
      isShowError,
      message,
      flatList: flatList || [],
      entryList: entryList || [],
      username: username || '',
      nickname,
      createdAt,
      expiredAt,
      leftTimes,
      downloadName,
    }
  }, [response])

  useEffect(() => {
    const tick = () => {
      let tip = t`tip.unlimited`
      if (expiredAt !== undefined) {
        const restMillis = expiredAt - Date.now()
        if (restMillis > 0) {
          const { months, days, hours, minutes } = Duration.fromMillis(restMillis).shiftTo('month', 'day', 'hour', 'minute').toObject()
          tip = [
            { unit: 'M', count: months },
            { unit: 'D', count: days },
            { unit: 'H', count: hours },
            { unit: 'min', count: minutes? Math.floor(minutes) : 0 },
          ]
            .map(({ unit, count }) => count ? `${count}${unit}` : '')
            .filter(Boolean)
            .slice(0, 2)
            .join(' ')
        } else {
          tip = t`tip.expired`
        }
      }
      setExpiredAtTip(tip)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiredAt, t])

  const disabled = useMemo(() => {
    const isNoLeft = leftTimes === 0
    const isExpired = !!(expiredAt && expiredAt < Date.now())
    const disabled = isNoLeft || isExpired || isShowInput
    return disabled
  }, [expiredAt, leftTimes, isShowInput])

  const handleDownloadClick = useCallback(async () => {
    if (code) {
      const { success, message } = await queryTunnelCheck(code, passwordVal)
      if (success) {
        TunnelApi.download(code, passwordVal)
        setTimeout(() => {
          queryTunnel(code, passwordVal)
        }, 50)
      } else {
        toast.error(message || 'ERROR')
      }
    }
  }, [code, passwordVal, queryTunnelCheck, queryTunnel])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-gradient-to-b from-black to-zinc-600 flex justify-center items-center overflow-hidden">
        <div
          className={line(`
            absolute z-0 inset-0 bg-cover bg-center
            transition-all duration-1000 ease-out
            ${activePage === 'sharing' ? 'scale-100 bg-opacity-100' : 'scale-110 opacity-50'}
          `)}
          style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-sharing')}")` }}
        />
        <div
          className={line(`
            relative m-4 md:m-0 px-4 md:px-10 py-6 md:py-8 w-full md:w-[40rem]
            bg-white rounded-2xl shadow-2xl overflow-hidden
            dark:bg-zinc-700
          `)}
        >
          <div className="absolute z-0 top-0 right-0 -mt-16 -mr-16">
            <SvgIcon.Share className="text-gray-100 dark:text-zinc-600" size={320} />
          </div>
          {isSuccess && (
            <div className="relative z-10">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover flex-shrink-0 dark:border-zinc-400"
                  style={{ backgroundImage: `url("${FsApi.getPublicAvatarStreamUrl(username)}")` }}
                />
                <div className="ml-4 flex-grow">
                  <p className="text-sm md:text-base dark:text-zinc-200">
                    {t('title.page_shared_by', { name: nickname })}
                  </p>
                  <p className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                    {createdAt && getDateTime(createdAt).slice(0, -3)}
                  </p>
                </div>
                <div className="flex">
                  <Popover
                    showArrow
                    trigger="hover"
                    position="bottomRight"
                    content={(
                      <div className="p-4">
                        <div className="w-56 h-40 flex justify-center items-center">
                          <QRCodeCanvas value={sharingUrl} className="border-2 border-white" />
                        </div>
                        <p className="mt-2 w-56 break-all text-xs text-gray-400">
                          {sharingUrl}
                        </p>
                      </div>
                    )}
                  >
                    <span className="cursor-pointer">
                      <SvgIcon.QrCode className="text-gray-400 dark:text-zinc-200" />
                    </span>
                  </Popover>
                  <span
                    className="ml-3 md:ml-2 cursor-pointer"
                    onClick={() => {
                      copy(sharingUrl)
                      toast.success(t`tip.copied`)
                    }}
                  >
                    <SvgIcon.Copy className="text-gray-400 dark:text-zinc-200" />
                  </span>
                </div>
              </div>
              {isShowInput ? (
                <div className="my-6 px-8 py-16 border backdrop-blur">
                  <p className="text-sm text-gray-500 text-center">{t`tip.sharingWithPassword`}</p>
                  <div className="mt-4 flex justify-center">
                    <Input
                      autoFocus
                      showClear
                      placeholder={t`hint.inputAccessPassword`}
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
                        {t`action.confirm`}
                      </Button>
                  </div>
                </div>
              ) : (
                <EntryListPanel
                  downloadName={downloadName || ''}
                  entryList={entryList}
                  flatList={flatList}
                />
              )}
              {code && (
                <div className="flex flex-wrap justify-between items-center">
                  <div className="w-full md:w-auto text-center md:text-left text-xs text-gray-500 dark:text-zinc-400">
                    <p>
                      {t`label.remainingSaves`}{leftTimes === undefined ? t`tip.unlimited` : leftTimes}
                    </p>
                    <p>
                      <span className="mr-1">{t`label.remainingValidityPeriod`}{expiredAtTip}</span>
                      {expiredAt && (
                        <Tooltip
                          position="right"
                          className="text-xs"
                          content={getDateTime(expiredAt).slice(0, -3)}
                        >
                          <span><SvgIcon.Info className="-mt-[2px] inline text-gray-300" size={14} /></span>
                        </Tooltip>
                      )}
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
                      {t`action.saveToLocal`}
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

      <PublicFooter />
    </>
  )
}