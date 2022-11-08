import { Button } from '@douyinfe/semi-ui'
import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    code && getTunnel(code)
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
    hasFolder,
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
      hasFolder: entryList?.some(e => e.type === EntryType.directory),
    }
  }, [data])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-gradient-to-b from-gray-200 to-gray-400 flex justify-center items-center">
        <div className="m-4 md:m-0 px-4 md:px-10 py-8 bg-white rounded-2xl shadow-2xl">
          {success ? (
            <div>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover flex-shrink-0"
                  style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}")` }}
                />
                <div className="ml-4 flex-grow">
                  <p className="text-sm md:text-base">{nickname} 的分享</p>
                  <p className="flex justify-between text-xs text-gray-400">
                    {createdAt && getDateTime(createdAt).slice(0, -3)}
                  </p>

                </div>
                {hasFolder && (
                  <span
                    className="text-xs text-blue-500 cursor-pointer font-bold"
                    onClick={() => setAllMode(!allMode)}
                  >
                    {allMode ? '显示目录' : `显示全部 ${flattenList.length} 个文件`}
                  </span>
                )}
              </div>
              <div className="mt-6 px-2 py-1 text-xs bg-white border border-b-0 border-gray-100 font-din text-gray-600">
                {downloadName}
              </div>
              <div className="mb-6 max-h-50vh overflow-x-hidden overflow-y-auto">
                <div className="px-4 md:px-8 py-3 md:py-6 md:w-128 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 bg-gray-100">
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
              {code && (
                <div className="flex flex-wrap justify-between items-center">
                  <div className="w-full md:w-auto text-center md:text-left text-xs text-gray-400">
                    <p>有效期至 {expiredAt && getDateTime(expiredAt).slice(0, -3)}</p>
                    <p>剩余保存次数 {leftTimes}</p>
                  </div>
                  <Button
                    type="primary"
                    theme="solid"
                    className="mx-auto mt-4 md:m-0"
                    icon={<SvgIcon.Download />}
                    onClick={() => DownloadApi.download(code)}
                  >
                    保存到本地
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-20 py-8 font-din text-gray-500">
              <SvgIcon.G className="mx-auto text-gray-200" size={32} />
              <p className="mt-8">{message}</p>
            </div>
          )}
          {loading && (
            <div>
              <Spinner />
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