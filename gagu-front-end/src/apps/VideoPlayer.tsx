import { Spinner } from '@blueprintjs/core'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import CommonToolButtons from '../components/CommonToolButtons'
import { getBinFileUrl } from '../utils/api'
import { APP_ID_MAP } from '../utils/appList'
import { openedEntryListState } from '../utils/state'
import { AppComponentProps, IOpenedEntry } from '../utils/types'


export default function VideoPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [currentEntry, setCurrentEntry] = useState<IOpenedEntry | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    const openedEntry = openedEntryList[0]
    if (openedEntry && !openedEntry.isOpen && openedEntry.openAppId === APP_ID_MAP.videoPlayer) {
      setCurrentEntry(openedEntry)
      setOpenedEntryList([])
    }

  }, [openedEntryList, setOpenedEntryList])

  useEffect(() => {
    if (currentEntry) {
      setLoading(true)
      const { parentPath, name, isOpen } = currentEntry
      const fileUrl = getBinFileUrl(`${parentPath}/${name}`)
      setFileUrl(fileUrl)

      if (!isOpen) {
        setWindowTitle(name)
        setCurrentEntry({ ...currentEntry, isOpen: true })
      }
    }
  }, [currentEntry, setWindowTitle])

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <div className="h-8 flex-shrink-0 flex items-center bg-white">
          <CommonToolButtons {...{ currentEntry }} />
        </div>
        <div className="relative flex-grow bg-black">
          <div className="absolute inset-0 flex justify-center items-center">
            {loading && <Spinner />}
            <video
              autoPlay
              controls
              src={fileUrl}
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
