import { Spinner } from '../../components/base'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { APP_ID_MAP, APP_LIST } from '..'
import { AppComponentProps } from '../../types'
import { useOpenOperation, useHotKey } from '../../hooks'
import ThumbnailList from './ThumbnailList'
import Toolbar from './Toolbar'
import Viewer from './Viewer'
import { line } from '../../utils'
import { useRecoilState } from 'recoil'
import { entrySelectorState } from '../../states'
import { useTranslation } from 'react-i18next'

export default function PhotoViewer(props: AppComponentProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    setWindowLoading,
  } = props

  const { t } = useTranslation()

  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.photoViewer)

  const [, setEntrySelector] = useRecoilState(entrySelectorState)

  const [loading, setLoading] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [viewerShow, setViewerShow] = useState(false)
  const [thumbnailListShow, setThumbnailListShow] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const imgEl = useMemo(() => {
    return imgRef.current || null as HTMLImageElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgRef.current])

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

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
    bindCondition: isTopWindow && !viewerShow,
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
            {!activeEntry && (
              <div
                className="m-2 p-2 border border-gray-500 cursor-pointer text-xs text-white rounded-sm text-center hover:border-gray-300"
                onClick={() => setEntrySelector({ show: true, app: APP_LIST.find(a => a.id === APP_ID_MAP.photoViewer) })}
              >
                {t`action.openFile`}
              </div>
            )}
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
            imgEl={imgEl}
            activeIndex={activeIndex}
            activeEntry={activeEntry}
            matchedEntryList={matchedEntryList}
            isLight={isLight}
            thumbnailListShow={thumbnailListShow}
            setIsLight={setIsLight}
            setThumbnailListShow={setThumbnailListShow}
            handlePrevOrNext={handlePrevOrNext}
          />

        </div>

        <ThumbnailList
          show={thumbnailListShow}
          activeIndex={activeIndex}
          matchedEntryList={matchedEntryList}
          windowWidth={windowWidth}
          onClick={setActiveIndex}
        />

      </div>

      <Viewer
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        matchedEntryList={matchedEntryList}
        viewerShow={viewerShow}
        setViewerShow={setViewerShow}
      />

    </>
  )
}
