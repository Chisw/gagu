import { Spinner } from '../components/base'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { APP_ID_MAP } from '../utils/appList'
import { openedEntryListState } from '../utils/state'
import { AppComponentProps, IOpenedEntry } from '../utils/types'


export default function PhotoGallery(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [currentEntry, setCurrentEntry] = useState<IOpenedEntry | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    const openedEntry = openedEntryList[0]
    if (openedEntry && !openedEntry.isOpen && openedEntry.openAppId === APP_ID_MAP.photoGallery) {
      setCurrentEntry(openedEntry)
      setOpenedEntryList([])
    }

  }, [openedEntryList, setOpenedEntryList])

  useEffect(() => {
    if (currentEntry) {
      setLoading(true)
      const { parentPath, name, isOpen } = currentEntry
      const fileUrl = FsApi.getFileStreamUrl(`${parentPath}/${name}`)
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
        <img
          src={fileUrl}
          alt="img"
          className={loading ? 'hidden' : 'max-w-full max-h-full'}
          onLoad={() => setLoading(false)}
          onError={() => { }}
        />
      </div>
    </>
  )
}
