import { Opener, Spinner } from '../../components/common'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AppComponentProps, AppId } from '../../types'
import { useOpenEvent, useHotKey } from '../../hooks'
import ThumbnailList from './ThumbnailList'
import Toolbar from './Toolbar'
import Viewer from './Viewer'
import { line } from '../../utils'

const appId = AppId.photoViewer

export default function PhotoViewer(props: AppComponentProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    onClose,
  } = props

  const {
    indexLabel,
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setMatchedEntryList,
    setActiveIndex,
  } = useOpenEvent(appId)

  const [loading, setLoading] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [viewerShow, setViewerShow] = useState(false)
  const [thumbnailListShow, setThumbnailListShow] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const imgEl = useMemo(() => {
    return imgRef.current || null as HTMLImageElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgRef.current])

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  const handlePrevOrNext = useCallback((offset: number) => {
    const max = matchedEntryList.length - 1
    let targetIndex = 0
    targetIndex = activeIndex + offset
    if (targetIndex > max) targetIndex = 0
    if (targetIndex < 0) targetIndex = max
    setActiveIndex(targetIndex)
  }, [matchedEntryList, activeIndex, setActiveIndex])

  useHotKey({
    type: 'keyup',
    binding: isTopWindow && !viewerShow,
    hotKeyMap: {
      'ArrowRight': () => handlePrevOrNext(1),
      'ArrowLeft': () => handlePrevOrNext(-1),
      'Shift+ArrowRight': () => handlePrevOrNext(6),
      'Shift+ArrowLeft': () => handlePrevOrNext(-6),
      'Enter': () => setViewerShow(true),
      'Shift': () => setIsLight(!isLight),
      ' ': () => setThumbnailListShow(!thumbnailListShow),
    },
  })

  return (
    <>
      <div className="gagu-app-photo-viewer absolute inset-0 flex flex-col select-none">

        <div
          className={line(`
            relative flex-grow group
            ${isLight ? 'bg-grid-light' : 'bg-grid-dark'}
            ${activeEntry ? 'cursor-zoom-in' : ''}
          `)}
          onClick={() => activeEntry && setViewerShow(true)}
        >
          {loading && <Spinner />}
          <div className={`absolute z-0 inset-0 ${activeEntry ? 'flex justify-center items-center' : ''}`}>
            {!activeEntry && <Opener appId={appId} />}
            {activeEntry && (
              <img
                ref={imgRef}
                src={activeEntryStreamUrl}
                alt="img"
                className="max-w-full max-h-full"
                onLoadedData={() => setLoading(false)}
                onLoadedDataCapture={() => setLoading(false)}
              />
            )}
          </div>

          <Toolbar
            {...{
              imgEl,
              indexLabel,
              activeIndex,
              setActiveIndex,
              activeEntry,
              matchedEntryList,
              setMatchedEntryList,
              isLight,
              thumbnailListShow,
              setIsLight,
              setThumbnailListShow,
            }}
            onPrevOrNext={handlePrevOrNext}
            onClose={onClose}
          />

        </div>

        <ThumbnailList
          show={thumbnailListShow}
          {...{
            activeIndex,
            matchedEntryList,
            windowWidth,
          }}
          onClick={setActiveIndex}
        />

      </div>

      <Viewer
        {...{
          indexLabel,
          activeIndex,
          setActiveIndex,
          matchedEntryList,
          viewerShow,
          setViewerShow,
        }}
      />

    </>
  )
}
