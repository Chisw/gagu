import { Opener, Spinner, SvgIcon } from '../../components/common'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AppComponentProps, AppId } from '../../types'
import { useRunAppEvent, useHotKey } from '../../hooks'
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
  } = useRunAppEvent(appId)

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
        >
          {loading && <Spinner />}

          <div
            className={`absolute z-0 inset-0 ${activeEntry ? 'flex justify-center items-center' : ''}`}
            onClick={() => activeEntry && setViewerShow(true)}
          >
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

          {matchedEntryList.length > 1 && (
            <>
              <div
                className={line(`
                  md:opacity-0 group-hover:opacity-100 flex justify-center items-center
                  absolute z-10 top-1/2 left-4 md:left-8 -translate-y-1/2
                  w-12 h-12 rounded-full bg-black bg-opacity-40 backdrop-blur
                  text-white md:text-opacity-60 hover:text-opacity-100 active:text-opacity-20
                  transition-all duration-200 cursor-pointer
                  active:scale-90
                `)}
                onClick={() => handlePrevOrNext(-1)}
              >
                <SvgIcon.ChevronLeft size={24} />
              </div>
              <div
                className={line(`
                  md:opacity-0 group-hover:opacity-100 flex justify-center items-center
                  absolute z-10 top-1/2 right-4 md:right-8 -translate-y-1/2
                  w-12 h-12 rounded-full bg-black bg-opacity-40 backdrop-blur
                  text-white md:text-opacity-60 hover:text-opacity-100 active:text-opacity-20
                  transition-all duration-200 cursor-pointer
                  active:scale-90
                `)}
                onClick={() => handlePrevOrNext(1)}
              >
                <SvgIcon.ChevronRight size={24} />
              </div>
            </>
          )}

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
