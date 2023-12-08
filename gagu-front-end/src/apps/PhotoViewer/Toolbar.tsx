import { useMemo, useCallback, useEffect, useState } from 'react'
import { DownloadApi, FsApi, TunnelApi } from '../../api'
import { Confirmor, IconButton, SvgIcon } from '../../components/common'
import { useRequest } from '../../hooks'
import { TunnelType, IEntry } from '../../types'
import { getEntryPath, getReadableSize, line } from '../../utils'
import { getBaiduMapPinUrl } from '../../utils'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../../states'

interface ToolbarProps {
  imgEl: HTMLImageElement | null
  indexLabel: string
  activeIndex: number
  activeEntry?: IEntry
  matchedEntryList: IEntry[]
  isLight: boolean
  thumbnailListShow: boolean
  setActiveIndex: (index: number) => void
  setMatchedEntryList: (entryList: IEntry[]) => void
  setIsLight: (is: boolean) => void
  setThumbnailListShow: (is: boolean) => void
  onPrevOrNext: (offset: number) => void
  onClose: () => void
}

export default function Toolbar(props: ToolbarProps) {

  const {
    imgEl,
    indexLabel,
    activeIndex,
    activeEntry,
    matchedEntryList,
    isLight,
    thumbnailListShow,
    setActiveIndex,
    setMatchedEntryList,
    setIsLight,
    setThumbnailListShow,
    onPrevOrNext,
    onClose,
  } = props

  const { t } = useTranslation()

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { request: queryExif, data: exifData, setData, loading: querying } = useRequest(FsApi.queryExif)
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
    setData(null)
  }, [activeIndex, setData])

  const getExifData = useCallback(async () => {
    if (activeEntry && ['jpg', 'jpeg'].includes(activeEntry.extension)) {
      const { data } = await queryExif(`${activeEntry.parentPath}/${activeEntry.name}`)
      const url = getBaiduMapPinUrl(data, activeEntry?.name)
      setMapPinUrl(url)
    }
  }, [activeEntry, queryExif])

  const buttonList = useMemo(() => {
    return [
      {
        icon: <SvgIcon.ChevronLeft size={14} />,
        title: t`action.previousPicture`,
        onClick: () => onPrevOrNext(-1),
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
            const { success, data: code } = await createTunnel({
              type: TunnelType.download,
              entryList: [activeEntry],
              downloadName,
            })
            if (success) {
              DownloadApi.download(code)
            }
          }
        },
      },
      {
        icon: <SvgIcon.Info size={14} />,
        title: t`action.exifInfo`,
        disabled: !activeEntry || !['jpg', 'jpeg'].includes(activeEntry.extension) || querying,
        onClick: getExifData,
      },
      {
        icon: <SvgIcon.Delete size={14} />,
        title: t`action.delete`,
        disabled: !activeEntry,
        onClick: () => {
          const { name } = activeEntry!
          Confirmor({
            type: 'delete',
            content: t('tip.deleteItem', { name }),
            onConfirm: async (close) => {
              const { success } = await deleteEntry(getEntryPath(activeEntry))
              if (success) {
                setLastChangedDirectory({ path: activeEntry!.parentPath, timestamp: Date.now() })
                const len = matchedEntryList.length
                if (len === 1) {
                  onClose()
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
        onClick: () => onPrevOrNext(1),
      },
    ]
  }, [
    t,
    matchedEntryList,
    activeEntry,
    getExifData,
    onPrevOrNext,
    setThumbnailListShow,
    thumbnailListShow,
    setIsLight,
    isLight,
    createTunnel,
    deleteEntry,
    setLastChangedDirectory,
    onClose,
    activeIndex,
    setActiveIndex,
    setMatchedEntryList,
    querying,
  ])

  return (
    <>
      <div
        className={line(`
          absolute z-10 bottom-0 right-0 left-0
          flex items-center
          text-xs px-2 py-1 bg-black bg-opacity-50 text-white
          transition-opacity duration-200
          md:opacity-0 group-hover:opacity-100
          cursor-default
          ${thumbnailListShow ? 'opacity-100' : ''}
          ${activeEntry ? '' : 'hidden'}
        `)}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-28 font-din">
          {indexLabel}
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
          absolute z-20 inset-0
          text-xs text-white break-words cursor-default
          bg-gray-700 bg-opacity-70 backdrop-blur
          transition-transform duration-200
          ${exifData ? 'scale-100' : 'scale-0'}
        `)}
        onClick={e => e.stopPropagation()}
      >
        {mapPinUrl && (
          <IconButton
            icon={<SvgIcon.Pin size={12} />}
            size="sm"
            onClick={() => window.open(mapPinUrl)}
            className="absolute z-10 top-1 right-8"
          />
        )}
        {exifData && (
          <IconButton
            icon={<SvgIcon.Close size={12} />}
            size="sm"
            onClick={() => setData(null)}
            className="absolute z-10 top-1 right-1"
          />
        )}
        <div className="absolute z-0 inset-0 pb-4 overflow-y-auto text-xs select-text">
          {Object.entries(exifData?.data || {}).map(([key, value]) => (
            <div
              key={key}
              className="mb-3"
            >
              <div className="py-2 text-center text-base font-bold">-- {key} --</div>
              <div className="ml-2 flex-grow flex flex-wrap">
                {Object.entries(value || {}).map(([_key, _value]) => (
                  <div
                    key={_key}
                    className="mt-2 w-full flex"
                  >
                    <div className="flex-shrink-0 w-1/2 text-right">{_key}:</div>
                    <div className="ml-2 flex-grow flex break-all max-h-10 overflow-y-auto">
                      {_value as string}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
