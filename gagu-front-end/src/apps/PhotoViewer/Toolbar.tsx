import { useMemo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DownloadApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { IconButton } from '../../components/base/IconButton'
import { useFetch } from '../../hooks'
import { TunnelType, IEntry } from '../../types'
import { DOWNLOAD_PERIOD, getPaddedNo, getReadableSize, line } from '../../utils'

interface ToolbarProps {
  imgEl: HTMLImageElement | null
  activeIndex: number
  activeEntry?: IEntry
  matchedEntryList: IEntry[]
  isLight: boolean
  thumbnailListShow: boolean
  setIsLight: (is: boolean) => void
  setThumbnailListShow: (is: boolean) => void
  handlePrevOrNext: (offset: number) => void
}

export default function Toolbar(props: ToolbarProps) {

  const {
    imgEl,
    activeIndex,
    activeEntry,
    matchedEntryList,
    isLight,
    thumbnailListShow,
    setIsLight,
    setThumbnailListShow,
    handlePrevOrNext,
  } = props

  const [sizeInfo, setSizeInfo] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (imgEl) {
      imgEl.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = imgEl
        setSizeInfo({ width, height })
      }
    }
  }, [imgEl, activeEntry])

  const { fetch: getExif, data: ExifData, setData } = useFetch(FsApi.getExif)
  const { fetch: createTunnel } = useFetch(DownloadApi.create)

  const getExifData = useCallback(() => {
    if (activeEntry && ['jpg', 'jpeg'].includes(activeEntry.extension)) {
      getExif(`${activeEntry.parentPath}/${activeEntry.name}`)
    }
  }, [activeEntry, getExif])

  const buttonList = useMemo(() => {
    return [
      {
        icon: <SvgIcon.ChevronLeft size={14} />,
        title: '上一张',
        onClick: () => handlePrevOrNext(-1),
      },
      {
        icon: <SvgIcon.LayoutBottom size={14} />,
        title: '更多',
        disabled: !matchedEntryList.length,
        onClick: () => setThumbnailListShow(!thumbnailListShow),
      },
      {
        icon: <SvgIcon.Bulb size={14} />,
        title: '背景切换',
        onClick: () => setIsLight(!isLight),
      },
      {
        icon: <SvgIcon.Download size={14} />,
        title: '下载',
        disabled: !activeEntry,
        onClick: async () => {
          if (activeEntry) {
            const { name: downloadName } = activeEntry
            const res = await createTunnel({
              type: TunnelType.download,
              entryList: [activeEntry],
              downloadName,
              leftTimes: 1,
              expiredAt: Date.now() + DOWNLOAD_PERIOD,
            })
            if (res && res.success && res.code) {
              DownloadApi.download(res.code)
            } else {
              res && toast.error(res.message)
            }
          }
        },
      },
      {
        icon: <SvgIcon.Info size={14} />,
        title: 'Exif 信息',
        disabled: !activeEntry || !['jpg', 'jpeg'].includes(activeEntry.extension),
        onClick: getExifData,
      },
      {
        icon: <SvgIcon.Delete size={14} />,
        title: '删除',
        disabled: !activeEntry,
        onClick: () => { },
      },
      {
        icon: <SvgIcon.ChevronRight size={14} />,
        title: '下一张',
        onClick: () => handlePrevOrNext(1),
      },
    ]
  }, [thumbnailListShow, isLight, getExifData, activeEntry, matchedEntryList, setIsLight, setThumbnailListShow, handlePrevOrNext, createTunnel])

  return (
    <>
      <div
        className={line(`
          absolute z-10 bottom-0 right-0 left-0
          flex items-center
          text-xs px-2 py-1 bg-black-500 text-white
          transition-opacity duration-200
          opacity-0 group-hover:opacity-100
          cursor-default
          ${thumbnailListShow ? 'opacity-100' : ''}
        `)}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-28 font-din">
          {getPaddedNo(activeIndex, matchedEntryList.length)}
        </div>

        <div className="flex-grow flex justify-center">
          {buttonList.map(({ icon, title, onClick, disabled }) => (
            <IconButton
              key={title}
              icon={icon}
              size="sm"
              className="mx-1"
              disabled={disabled}
              title={title}
              onClick={onClick}
            />
          ))}
        </div>
        <div className="w-28 font-din text-right">
          {sizeInfo.width} &times; {sizeInfo.height}PX
          &nbsp;&nbsp;
          {getReadableSize(activeEntry?.size || 0)}
        </div>
      </div>

      <div
        className={line(`
          absolute z-20 top-0 left-0
          p-2 w-full max-h-1/3
          overflow-y-auto
          text-xs text-white break-words
          bg-black-300 backdrop-filter backdrop-blur
          cursor-default
          ${ExifData ? 'block' : 'hidden'}
        `)}
        onClick={e => e.stopPropagation()}
      >
        <code>
          {JSON.stringify(ExifData)}
        </code>
        <IconButton
          icon={<SvgIcon.Close size={12} />}
          onClick={() => setData(null)}
          size="xs"
          className="absolute top-0 right-0 m-1"
        />
      </div>
    </>
  )
}
