import { Confirmor, Opener, Spinner, SvgIcon } from '../../components/common'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AppComponentProps, AppId, TunnelType } from '../../types'
import { useRunAppEvent, useHotKey, useRequest } from '../../hooks'
import ThumbnailList from './ThumbnailList'
import Toolbar from './Toolbar'
import Viewer from './Viewer'
import { getBaiduMapPinUrl, getEntryPath, line } from '../../utils'
import { FsApi, TunnelApi } from '../../api'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../../states'

const appId = AppId.photoViewer

export default function PhotoViewer(props: AppComponentProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    closeWindow,
  } = props

  const { t } = useTranslation()

  const {
    indexLabel,
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setMatchedEntryList,
    setActiveIndex,
  } = useRunAppEvent(appId)

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const [loading, setLoading] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [viewerShow, setViewerShow] = useState(false)
  const [thumbnailListShow, setThumbnailListShow] = useState(false)
  const [mapPinUrl, setMapPinUrl] = useState('')

  const imgRef = useRef<HTMLImageElement>(null)
  const imgEl = useMemo(() => {
    return imgRef.current || null as HTMLImageElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgRef.current])

  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: queryExifInfo, response: exifResponse, setResponse: setExifResponse, loading: queryingExifData } = useRequest(FsApi.queryExifInfo)
  const { request: deleteEntry } = useRequest(FsApi.deleteEntry)

  const handlePrevOrNext = useCallback((offset: number) => {
    const max = matchedEntryList.length - 1
    let targetIndex = 0
    targetIndex = activeIndex + offset
    if (targetIndex > max) targetIndex = 0
    if (targetIndex < 0) targetIndex = max
    setActiveIndex(targetIndex)
  }, [matchedEntryList, activeIndex, setActiveIndex])

  const handleDownloadClick = useCallback(async () => {
    if (activeEntry) {
      const { name: downloadName } = activeEntry
      const { success, data: code } = await createTunnel({
        type: TunnelType.download,
        entryList: [activeEntry],
        downloadName,
      })
      if (success) {
        TunnelApi.download(code)
      }
    }
  }, [activeEntry, createTunnel])

  const handleGetExifData = useCallback(async () => {
    if (activeEntry && ['jpg', 'jpeg'].includes(activeEntry.extension)) {
      const { data } = await queryExifInfo(`${activeEntry.parentPath}/${activeEntry.name}`)
      const url = getBaiduMapPinUrl(data, activeEntry?.name)
      setMapPinUrl(url)
    }
  }, [activeEntry, queryExifInfo])

  const handleDeleteClick = useCallback(() => {
    const { name } = activeEntry!
    Confirmor({
      type: 'delete',
      content: t('tip.deleteItem', { name }),
      onConfirm: async (close) => {
        const { success } = await deleteEntry(getEntryPath(activeEntry))
        if (success) {
          setLastChangedDirectory({ path: activeEntry!.parentPath, timestamp: Date.now() })
          const count = matchedEntryList.length
          if (count === 1) {
            closeWindow()
          } else {
            const newActiveIndex = activeIndex === count - 1
              ? activeIndex - 1
              : activeIndex
            setActiveIndex(newActiveIndex)
            setMatchedEntryList(matchedEntryList.filter(e => e.name !== name))
          }
          close()
        }
      },
    })
  }, [activeEntry, activeIndex, deleteEntry, matchedEntryList, closeWindow, setActiveIndex, setLastChangedDirectory, setMatchedEntryList, t])

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(`[${indexLabel}] ${activeEntry.name}`)
    }
  }, [indexLabel, activeEntry, setWindowTitle])

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'ArrowRight, ArrowRight': () => handlePrevOrNext(1),
      'ArrowLeft, ArrowLeft': () => handlePrevOrNext(-1),
      'Shift+ArrowRight, Shift+ArrowRight': () => handlePrevOrNext(6),
      'Shift+ArrowLeft, Shift+ArrowLeft': () => handlePrevOrNext(-6),
      'Enter, Enter': () => setViewerShow(true),
      'Shift+Space, Shift+Space': () => setIsLight(!isLight),
      'Space, Space': () => setThumbnailListShow(!thumbnailListShow),
      'Meta+KeyD, Ctrl+KeyD': handleDownloadClick,
      'Meta+KeyI, Ctrl+KeyI': handleGetExifData,
      'Escape, Escape': () => setExifResponse(null),
      'Meta+Backspace, Shift+Delete': handleDeleteClick,
      'ArrowUp, ArrowUp': () => (document.querySelector('.gagu-photo-viewer-scale-large') as any)?.click(),
      'ArrowDown, ArrowDown': () => (document.querySelector('.gagu-photo-viewer-scale-small') as any)?.click(),
      'KeyR, KeyR': () => (document.querySelector('.gagu-photo-viewer-rotate') as any)?.click(),
    },
  })

  return (
    <>
      <div className="gagu-app-photo-viewer absolute inset-0 flex flex-col select-none">

        <div
          className={line(`
            relative flex-grow group
            ${isLight ? 'bg-grid-light' : 'bg-grid-dark bg-gray-900'}
            ${activeEntry ? 'cursor-zoom-in' : ''}
          `)}
        >
          {loading && <Spinner />}

          <div
            className={`absolute z-0 inset-0 ${activeEntry ? 'flex justify-center items-center' : ''}`}
            onClick={() => activeEntry && setViewerShow(true)}
          >
            <Opener show={!activeEntry} appId={appId} />

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
              activeIndex,
              activeEntry,
              matchedEntryList,
              isLight,
              thumbnailListShow,
              setIsLight,
              setThumbnailListShow,
              mapPinUrl,
              exifResponse,
              setExifResponse,
              queryingExifData,
            }}
            onDownloadClick={handleDownloadClick}
            onGetExifData={handleGetExifData}
            onDeleteClick={handleDeleteClick}
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
