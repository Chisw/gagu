import { useMemo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DownloadApi, FsApi, TunnelApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { Confirmor, IconButton } from '../../components/base'
import { useRequest } from '../../hooks'
import { TunnelType, IEntry } from '../../types'
import { DOWNLOAD_PERIOD, getEntryPath, getPaddedNo, getReadableSize, line } from '../../utils'
import { getBaiduMapPinUrl } from '../../utils'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedPathState } from '../../states'

interface ToolbarProps {
  imgEl: HTMLImageElement | null
  activeIndex: number
  activeEntry?: IEntry
  matchedEntryList: IEntry[]
  isLight: boolean
  thumbnailListShow: boolean
  setActiveIndex: (index: number) => void
  setMatchedEntryList: (entryList: IEntry[]) => void
  setIsLight: (is: boolean) => void
  setThumbnailListShow: (is: boolean) => void
  handlePrevOrNext: (offset: number) => void
  closeWindow: () => void
}

export default function Toolbar(props: ToolbarProps) {

  const {
    imgEl,
    activeIndex,
    activeEntry,
    matchedEntryList,
    isLight,
    thumbnailListShow,
    setActiveIndex,
    setMatchedEntryList,
    setIsLight,
    setThumbnailListShow,
    handlePrevOrNext,
    closeWindow,
  } = props

  const { t } = useTranslation()

  const [, setLastUploadedPath] = useRecoilState(lastChangedPathState)

  const { request: getExif, data: ExifData, setData } = useRequest(FsApi.getExif)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: deleteEntry } = useRequest(FsApi.deleteEntry)

  const [sizeInfo, setSizeInfo] = useState({ width: 0, height: 0 })
  const [mapPinUrl, setMapPinUrl] = useState('')

  useEffect(() => {
    if (imgEl) {
      imgEl.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = imgEl
        setSizeInfo({ width, height })
      }
    }
  }, [imgEl, activeEntry])

  useEffect(() => {
    setMapPinUrl(getBaiduMapPinUrl(ExifData, activeEntry?.name))
  }, [ExifData, activeEntry])

  const getExifData = useCallback(() => {
    if (activeEntry && ['jpg', 'jpeg'].includes(activeEntry.extension)) {
      getExif(`${activeEntry.parentPath}/${activeEntry.name}`)
    }
  }, [activeEntry, getExif])

  const buttonList = useMemo(() => {
    return [
      {
        icon: <SvgIcon.ChevronLeft size={14} />,
        title: t`action.previousPicture`,
        onClick: () => handlePrevOrNext(-1),
      },
      {
        icon: <SvgIcon.LayoutBottom size={14} />,
        title: t`action.more`,
        disabled: !matchedEntryList.length,
        onClick: () => setThumbnailListShow(!thumbnailListShow),
      },
      {
        icon: <SvgIcon.Contrast size={14} />,
        title: t`action.switchBackground`,
        onClick: () => setIsLight(!isLight),
      },
      {
        icon: <SvgIcon.Download size={14} />,
        title: t`action.download`,
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
        title: t`action.exifInfo`,
        disabled: !activeEntry || !['jpg', 'jpeg'].includes(activeEntry.extension),
        onClick: getExifData,
      },
      {
        icon: <SvgIcon.Delete size={14} />,
        title: t`action.delete`,
        disabled: !activeEntry,
        onClick: () => {
          const { name } = activeEntry!
          Confirmor({
            t,
            type: 'delete',
            content: t('tip.deleteItem', { name }),
            onConfirm: async (close) => {
              const { success } = await deleteEntry(getEntryPath(activeEntry))
              if (success) {
                setLastUploadedPath({ path: activeEntry!.parentPath, timestamp: Date.now() })
                const len = matchedEntryList.length
                if (len === 1) {
                  closeWindow()
                } else {
                  const newActiveIndex = activeIndex === matchedEntryList.length - 1
                    ? activeIndex - 1
                    : activeIndex
                  setActiveIndex(newActiveIndex)
                  setMatchedEntryList(matchedEntryList.filter(e => e.name !== name))
                }
                close()
              }
            },
          })
        },
      },
      {
        icon: <SvgIcon.ChevronRight size={14} />,
        title: t`action.nextPicture`,
        onClick: () => handlePrevOrNext(1),
      },
    ]
  }, [t, matchedEntryList, activeEntry, getExifData, handlePrevOrNext, setThumbnailListShow, thumbnailListShow, setIsLight, isLight, createTunnel, deleteEntry, setLastUploadedPath, closeWindow, activeIndex, setActiveIndex, setMatchedEntryList])

  return (
    <>
      <div
        className={line(`
          absolute z-10 bottom-0 right-0 left-0
          flex items-center
          text-xs px-2 py-1 bg-black bg-opacity-50 text-white
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
          p-2 w-full max-h-[33.33%]
          overflow-y-auto
          text-xs text-white break-words
          bg-black bg-opacity-30 backdrop-filter backdrop-blur
          cursor-default
          ${ExifData ? 'block' : 'hidden'}
        `)}
        onClick={e => e.stopPropagation()}
      >
        {mapPinUrl && (
          <a
            target="_blank"
            rel="noreferrer"
            className="inline-block m-2 p-1 rounded-full bg-gray-100 hover:bg-white"
            href={mapPinUrl}
          >
            <SvgIcon.Pin className="text-red-500" />
          </a>
        )}
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
