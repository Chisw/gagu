import { Spinner } from '../components/base'
import { useEffect, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../types'
import { useOpenOperation } from '../hooks'
import { FsApi } from '../api'

export default function WebAMP(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    matchedEntryList,
    // activeIndex,
    activeEntry,
    // activeEntryStreamUrl,
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

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const id = 'webapp-script'
    const exist = document.querySelector(`#${id}`)
    if (exist) {
      setLoaded(true)
    } else {
      const src = `https://unpkg.com/webamp`
      const script = document.createElement('script')
      script.setAttribute('id', id)
      script.src = src
      document.body.append(script)
      script.onload = () => setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (loaded) {
      const options = {
        initialTracks: matchedEntryList.map(entry => ({
          metaData: {
            artist: 'artist',
            title: entry.name,
          },
          url: FsApi.getFileStreamUrl(entry),
        }))
      }
      const webamp = new (window as any).Webamp(options);
      console.log(matchedEntryList, options)
      webamp.renderWhenReady(document.getElementById('gg-app-webamp'));
    }
  }, [loaded, matchedEntryList])

  return (
    <>
      <div className="absolute inset-0 flex justify-center items-center">
        {loading && <Spinner />}
        <div id="gg-app-webamp"></div>
      </div>
    </>
  )
}
