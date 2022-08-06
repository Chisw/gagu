import { Spinner } from '@blueprintjs/core'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { getBinFileUrl } from '../utils/api'
import { APP_ID_MAP } from '../utils/appList'
import { openedEntryListState } from '../utils/state'
import { AppComponentProps, IOpenedEntry } from '../utils/types'


export default function MusicPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [currentEntry, setCurrentEntry] = useState<IOpenedEntry | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    const openedEntry = openedEntryList[0]
    if (openedEntry && !openedEntry.isOpen && openedEntry.openAppId === APP_ID_MAP.musicPlayer) {
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
      <div className="absolute inset-0 flex justify-center items-center">
        {loading && <Spinner />}
        <audio
          autoPlay
          controls
          src={fileUrl}
          className={loading ? 'hidden' : 'max-w-full max-h-full outline-none'}
          onLoadedData={() => setLoading(false)}
          onError={() => { }}
        />
      </div>
    </>
  )
}
