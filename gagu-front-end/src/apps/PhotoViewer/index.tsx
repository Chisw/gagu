import { Spinner, SvgIcon } from '../../components/base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FsApi } from '../../api'
import { APP_ID_MAP } from '../../utils/appList'
import { AppComponentProps } from '../../types'
import { PhotoSlider } from 'react-photo-view'
import { getReadableSize, line } from '../../utils'
import { useOpenOperation, useFetch } from '../../hooks'
import ThumbnailList from './ThumbnailList'

export default function PhotoViewer(props: AppComponentProps) {
  const {
    windowSize: { width: windowWidth },
    setWindowTitle,
    setWindowLoading,
  } = props
  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.photoViewer)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [bgLight, setBgLight] = useState(false)
  const [thumbnailListShow, setThumbnailListShow] = useState(false)

  const { fetch: getExif, data: ExifData, setData } = useFetch(FsApi.getExif)

  const getExifData = useCallback(() => {
    if (activeEntry && ['jpg', 'jpeg'].includes(activeEntry.extension)) {
      getExif(`${activeEntry.parentPath}/${activeEntry.name}`)
    }
  }, [activeEntry, getExif])

  const imgRef = useRef<HTMLImageElement>(null)

  const imgInfo = useMemo(() => {
    if (imgRef && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      return { naturalWidth, naturalHeight }
    } else {
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry, imgRef.current])

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle, getExif])

  const buttonList = useMemo(() => {
    return [
      {
        icon: <SvgIcon.LayoutBottom size={14} />,
        title: '更多',
        onClick: () => setThumbnailListShow(!thumbnailListShow),
      },
      {
        icon: <SvgIcon.Contrast size={14} />,
        title: '背景切换',
        onClick: () => setBgLight(!bgLight),
      },
      {
        icon: <SvgIcon.Info size={14} />,
        title: 'Exif 信息',
        onClick: getExifData,
      },
      {
        icon: <SvgIcon.Download size={14} />,
        title: '下载',
        onClick: () => { },
      },
      {
        icon: <SvgIcon.Delete size={14} />,
        title: '删除',
        onClick: () => { },
      },
    ]
  }, [thumbnailListShow, bgLight, getExifData])

  return (
    <>
      <div className="gg-app-photo-gallery absolute inset-0 flex flex-col select-none">
        <div className="absolute z-10 text-xs text-white top-0 left-0">
          <code onDoubleClick={() => setData(null)}>
            {JSON.stringify(ExifData)}
          </code>
        </div>

        {/* img */}
        <div
          className={`
            relative flex-grow cursor-zoom-in group
            ${bgLight ? 'bg-grid-light' : 'bg-grid-dark'}
          `}
          onClick={() => setVisible(true)}
        >
          {loading && <Spinner />}
          <div className="absolute z-0 inset-0 flex justify-center items-center">
            <img
              ref={imgRef}
              src={activeEntryStreamUrl}
              alt="img"
              className="max-w-full max-h-full"
              onLoadedData={() => setLoading(false)}
              onLoadedDataCapture={() => setLoading(false)}
            />
          </div>

          {/* toolbar */}
          <div
            className={line(`
              absolute z-10 bottom-0 right-0 left-0
              text-xs px-2 py-1 bg-black-500 text-white
              flex items-center cursor-default
              transition-opacity duration-200
              opacity-0 group-hover:opacity-100
              ${thumbnailListShow ? 'opacity-100' : ''}
            `)}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-28 font-din">
              {activeIndex + 1} / {matchedEntryList.length}
            </div>

            <div className="flex-grow flex justify-center">
              {buttonList.map(({ icon, title, onClick }) => (
                <div
                  key={title}
                  title={title}
                  className="mx-1 w-6 h-6 hover:bg-white-200 active:bg-white-100 cursor-pointer rounded-sm flex justify-center items-center"
                  onClick={onClick}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div className="w-28 font-din text-right">
              {imgInfo?.naturalWidth} &times; {imgInfo?.naturalHeight}PX
              &nbsp;&nbsp;
              {getReadableSize(activeEntry?.size || 0)}
            </div>
          </div>
        </div>

        {/* bottom thumbnail */}
        <ThumbnailList
          show={thumbnailListShow}
          activeIndex={activeIndex}
          matchedEntryList={matchedEntryList}
          windowWidth={windowWidth}
          onClick={setActiveIndex}
        />

      </div>

      <PhotoSlider
        images={matchedEntryList.map(entry => ({ src: FsApi.getFileStreamUrl(entry), key: entry.name }))}
        visible={visible}
        onClose={() => setVisible(false)}
        index={activeIndex}
        onIndexChange={index => setActiveIndex(index)}
        bannerVisible={false}
        overlayRender={({ rotate, onRotate, scale, onScale, index, images, onClose }) => {
          return (
            <div className="absolute z-10 top-0 right-0 left-0 h-10 flex items-center bg-black-500">
              <span className="text-white font-din text-xs">{index + 1} / {images.length} {matchedEntryList[index].name}</span>
              <div
                className="w-8 h-8 flex justify-center items-center text-gray-200 hover:text-gray-100 active:text-gray-300 cursor-pointer"
                onClick={() => onScale(scale - 1)}
              >
                <SvgIcon.SubtractCircle size={18} />
              </div>
              <div
                className="w-8 h-8 flex justify-center items-center text-gray-200 hover:text-gray-100 active:text-gray-300 cursor-pointer"
                onClick={() => onScale(scale + 1)}
              >
                <SvgIcon.AddCircle size={18} />
              </div>
              <div
                className="w-8 h-8 flex justify-center items-center text-gray-200 hover:text-gray-100 active:text-gray-300 cursor-pointer"
                onClick={() => onRotate(rotate + 90)}
              >
                <SvgIcon.Restart size={18} />
              </div>
              <div
                className="w-8 h-8 flex justify-center items-center text-gray-200 hover:text-gray-100 active:text-gray-300 cursor-pointer"
                onClick={onClose}
              >
                <SvgIcon.Close size={18} />
              </div>
            </div>
          )
        }}
      />
    </>
  )
}
