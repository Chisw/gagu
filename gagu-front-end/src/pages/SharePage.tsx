import { Button, Input } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { DownloadApi, FsApi } from '../api'
import Icon from '../apps/FileExplorer/EntryIcon'
import { Spinner, SvgIcon } from '../components/base'
import { useFetch } from '../hooks'
import { EntryType, IEntry } from '../types'
import { getDateTime, getReadableSize } from '../utils'

export default function SharePage() {

  const { code } = useParams()

  const [allMode, setAllMode] = useState(false)

  const { fetch: getTunnel, loading, data } = useFetch(DownloadApi.getTunnel)
  const { fetch: callTunnel, loading: calling } = useFetch(DownloadApi.callTunnel)

  useEffect(() => {
    code && getTunnel(code)
    document.title = 'Share - GAGU.IO'
  }, [getTunnel, code])

  const {
    success,
    message,
    flattenList,
    entryList,
    username,
    nickname,
    createdAt,
    expiredAt,
    leftTimes,
    downloadName,
    hasPassword,
    hasFolder,
    disabled,
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
      hasPassword,
    } = data?.tunnel || {}
    const isNoLeft = leftTimes === 0
    const isExpired = !!(expiredAt && expiredAt < Date.now())

    return {
      success,
      message,
      flattenList: flattenList || [],
      entryList: entryList || [],
      username: username || '',
      nickname,
      createdAt,
      expiredAt,
      leftTimes,
      downloadName,
      hasPassword,
      hasFolder: entryList?.some(e => e.type === EntryType.directory),
      disabled: isNoLeft || isExpired,
    }
  }, [data])

  const handleDownloadClick = useCallback(async () => {
    if (code) {
      const res = await callTunnel(code)
      if (res && res.success) {
        DownloadApi.download(code)
        setTimeout(() => {
          getTunnel(code)
        }, 1000)
      } else {
        toast.error(res?.message || 'ERROR')
      }
    }
  }, [code, callTunnel, getTunnel])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-gradient-to-b from-gray-600 to-gray-400 flex justify-center items-center">
        <div className="relative m-4 md:m-0 px-4 md:px-10 py-8 w-full md:w-160 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute z-0 top-0 right-0 -mt-16 -mr-16">
            <SvgIcon.Share className="text-gray-100" size={320} />
          </div>
          {success ? (
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
              <div className="my-6 backdrop-filter backdrop-blur-sm">
                <div className="px-3 py-2 text-xs bg-white-500 border border-b-0 border-gray-100 font-din flex justify-between items-center">
                  <span>
                    <span className="text-gray-600">{downloadName}</span>
                    <span className="text-gray-400">
                      &emsp;{getReadableSize(flattenList.map(e => e.size).filter(Boolean).reduce((a, b) => a! + b!, 0) as number)}
                    </span>
                  </span>
                  {hasFolder && (
                    <span
                      className="text-xs text-blue-500 cursor-pointer font-bold"
                      onClick={() => setAllMode(!allMode)}
                    >
                      {allMode ? '显示根目录' : `显示全部 ${flattenList.length} 个文件`}
                    </span>
                  )}
                </div>
                <div className="max-h-50vh overflow-x-hidden overflow-y-auto transition-all duration-200">
                  <div className="px-4 md:px-8 py-3 md:py-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 bg-gray-100 bg-opacity-40">
                    {(allMode ? flattenList : entryList).map((entry: IEntry) => (
                      <div
                        key={entry.parentPath + entry.name}
                        title={entry.name}
                        className="text-center"
                      >
                        <Icon hideApp entry={entry} />
                        <p className="line-clamp-2 mt-1 text-xs break-all max-w-32">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.type === 'file' && getReadableSize(entry.size || 0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {code && (
                <div className="flex flex-wrap justify-between items-center">
                  <div className="w-full md:w-auto text-center md:text-left text-xs text-gray-500">
                    <p>剩余保存次数：{leftTimes}</p>
                    <p>有效期至：{expiredAt ? getDateTime(expiredAt).slice(0, -3) : '无限期'}</p>
                  </div>
                  <div className="mt-4 mx-auto md:m-0 w-full md:w-auto flex justify-center">
                    {hasPassword && (
                      <Input
                        size="large"
                        placeholder="输入密码"
                        className="mr-4 w-36"
                        type="password"
                      />
                    )}
                    <Button
                      size="large"
                      type="primary"
                      theme="solid"
                      className="w-36"
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
          ) : (
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
          className="opacity-70 hover:opacity-100"
        >
          GAGU.IO
        </a>
      </div>
    </>
  )
}