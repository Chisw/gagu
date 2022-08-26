import { Spinner, SvgIcon } from '../components/base'
import { useEffect, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../utils/types'
import { useOpenOperation } from '../hooks'

export default function MusicPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.musicPlayer)

  const [loading, setLoading] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      // setLoading(true)
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900">
        {loading && <Spinner />}
        <div className="flex-grow overflow-y-auto">
          <div className="p-2 text-xs text-pink-200">播放列表</div>
          {matchedEntryList.map((entry, entryIndex) => {
            const { name } = entry
            const isActive = entryIndex === activeIndex
            return (
              <div
                key={name}
                className="px-2 py-1 text-xs text-white cursor-pointer hover:bg-white hover:text-pink-500"
                onClick={() => setActiveIndex(entryIndex)}
              >
                <span className="mr-1 font-din">{entryIndex + 1}.</span>
                <span>{name}</span>
                <span>{isActive && <SvgIcon.Check className="inline" />}</span>
              </div>
            )
          })}
        </div>
        <div className="p-4">
          <audio
            autoPlay
            controls
            src={activeEntryStreamUrl}
            className={loading ? 'hidden' : 'w-full max-h-full outline-none'}
            onLoadedData={() => setLoading(false)}
            onError={() => { }}
          />
        </div>
      </div>
    </>
  )
}
