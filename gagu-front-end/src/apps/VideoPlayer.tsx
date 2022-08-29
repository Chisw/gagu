import { Spinner } from '../components/base'
import { useEffect, useState } from 'react'
import CommonToolButtons from '../components/CommonToolButtons'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../types'
import { useOpenOperation } from '../hooks'

export default function VideoPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    // setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.videoPlayer)

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
      <div className="absolute inset-0 flex flex-col">
        <div className="h-8 flex-shrink-0 flex items-center bg-white">
          <CommonToolButtons {...{ activeEntry }} />
        </div>
        <div className="relative flex-grow bg-black">
          <div className="absolute inset-0 flex justify-center items-center">
            {loading && <Spinner />}
            <video
              autoPlay
              controls
              src={activeEntryStreamUrl}
              className={loading ? 'hidden' : 'max-w-full max-h-full outline-none'}
              onLoadedData={() => setLoading(false)}
              onError={() => { }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
