import { Spinner } from '../components/base'
import { useEffect, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../utils/types'
import { useOpenOperation } from '../hooks'

export default function MusicPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    // setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.musicPlayer)

  const [loading, setLoading] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      setLoading(true)
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  return (
    <>
      <div className="absolute inset-0 flex justify-center items-center bg-gradient-to-br from-pink-700 to-pink-900">
        {loading && <Spinner />}
        <audio
          autoPlay
          controls
          src={activeEntryStreamUrl}
          className={loading ? 'hidden' : 'max-w-full max-h-full outline-none'}
          onLoadedData={() => setLoading(false)}
          onError={() => { }}
        />
      </div>
    </>
  )
}
