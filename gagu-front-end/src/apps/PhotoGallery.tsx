import { Spinner, SvgIcon } from '../components/base'
import { useEffect, useMemo, useState } from 'react'
import { FsApi } from '../api'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../utils/types'
import { PhotoSlider } from 'react-photo-view'
import { line } from '../utils'
import useOpenOperation from '../hooks/useOpenOperation'

export default function PhotoGallery(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.photoGallery)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  const displayEntryList = useMemo(() => {
    const len = matchedEntryList.length
    if (0 < len && len <= 5) {
      return matchedEntryList
    } else {
      const start = Math.max(activeIndex - 4, 0)
      // const end = Math.min(activeIndex + 5, matchedEntryList.length - 1)
      return matchedEntryList.slice(start, 5)
    }
  }, [activeIndex, matchedEntryList])

  console.log(loading)

  return (
    <>
      <div className="absolute inset-0 flex flex-col select-none">
        <div className="absolute top-0 left-0 text-xs p-1 text-gray-400">
          {activeIndex + 1}/{matchedEntryList.length}
        </div>
        <div
          className="relative flex-grow cursor-zoom-in"
          onClick={() => setVisible(true)}
        >
          {loading && <Spinner />}
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src={activeEntryStreamUrl}
              alt="img"
              className={`max-w-full max-h-full ${loading ? '' : ''}`}
              onLoadedData={() => setLoading(false)}
              onLoadedDataCapture={() => setLoading(false)}
            />
          </div>
        </div>
        <div className="flex justify-center items-center p-2 h-12 bg-white border-t flex-shrink-0">
          <div
            className="w-4 h-full flex justify-center items-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-sm text-gray-500"
            onClick={() => activeIndex > 0 ? setActiveIndex(activeIndex - 1) : null}
          >
            <SvgIcon.ChevronLeft />
          </div>
          {displayEntryList.map(entry => {
            const src = FsApi.getFileStreamUrl(`${entry.parentPath}/${entry.name}`)
            const entryName = entry.name
            const isActive = entryName === activeEntry?.name
            return (
              <img
                key={entryName}
                alt={entryName}
                className={line(`
                  mx-2 w-10 cursor-pointer border-2
                  ${isActive ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}
                `)}
                src={src}
                onClick={() => setActiveIndex(matchedEntryList.findIndex(en => en.name === entryName))}
              />
            )
          })}
          <div
            className="w-4 h-full flex justify-center items-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-sm text-gray-500"
            onClick={() => activeIndex < matchedEntryList.length - 1 ? setActiveIndex(activeIndex + 1) : null}
          >
            <SvgIcon.ChevronRight />
          </div>
        </div>
      </div>

      <PhotoSlider
        images={matchedEntryList.map(entry => ({ src: FsApi.getFileStreamUrl(`${entry.parentPath}/${entry.name}`), key: entry.name }))}
        visible={visible}
        onClose={() => setVisible(false)}
        index={activeIndex}
        onIndexChange={index => setActiveIndex(index)}
      />
    </>
  )
}
