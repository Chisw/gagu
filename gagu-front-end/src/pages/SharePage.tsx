import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { DownloadApi, FsApi } from '../api'
import { useFetch } from '../hooks'
import { IEntry } from '../types'
import { getDateTime, getReadableSize } from '../utils'

export default function SharePage() {

  const { code } = useParams()

  const { fetch: getTunnel, loading, data } = useFetch(DownloadApi.getTunnel)

  useEffect(() => {
    code && getTunnel(code)
  }, [getTunnel, code])

  const { flattenList, entryList, creator, expiredAt, leftTimes } = useMemo(() => {
    if (data) {
      const { flattenList, tunnel: { entryList, creator, expiredAt, leftTimes } } = data
      return { flattenList, entryList, creator, expiredAt, leftTimes }
    } else {
      return {}
    }
  }, [data])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-gradient-to-b from-gray-200 to-gray-400 flex justify-center items-center">
        <div className="px-12 py-8 bg-white rounded-2xl">
          <div className="flex">
            <div
              className="w-10 h-10 rounded-full border-2 border-white shadow bg-center bg-cover"
              style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(creator)}")` }}
            />
            <div className="ml-4 flex-grow">
              <p>{creator}</p>
              <div className="flex justify-between text-xs text-gray-400">
                <p>给你分享了 {flattenList.length} 个文件</p>
                <p>有效期至：{getDateTime(expiredAt)} 剩余次数{leftTimes}</p>
              </div>
              {/* <p>{code}</p> */}
            </div>
          </div>
          <div className="py-8 grid grid-cols-5 gap-2">
            {flattenList.map((entry: IEntry) => (
              <div key={entry.name} className="text-center">
                <div className="mx-auto mb-2 w-16 h-16 bg-gray-100 rounded-lg"></div>
                <p className="text-sm break-all max-w-32">{entry.name}</p>
                <p className="text-xs text-gray-400">{getReadableSize(entry.size || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}