import { useMemo, useEffect, useState } from 'react'
import { IconButton, SvgIcon } from '../../components/common'
import { useUserConfig } from '../../hooks'
import { IEntry } from '../../types'
import { getReadableSize, line } from '../../utils'
import { useTranslation } from 'react-i18next'

interface ToolbarProps {
  imgEl: HTMLImageElement | null
  activeIndex: number
  activeEntry?: IEntry
  matchedEntryList: IEntry[]
  isLight: boolean
  thumbnailListShow: boolean
  mapPinUrl: string
  exifResponse: any
  queryingExifData: boolean
  setIsLight: (is: boolean) => void
  setThumbnailListShow: (is: boolean) => void
  setExifResponse: (response: any) => void
  onDownloadClick: () => void
  onGetExifData: () => void
  onDeleteClick: () => void
}

export default function Toolbar(props: ToolbarProps) {

  const {
    imgEl,
    activeIndex,
    activeEntry,
    matchedEntryList,
    isLight,
    thumbnailListShow,
    mapPinUrl,
    exifResponse,
    queryingExifData,
    setIsLight,
    setThumbnailListShow,
    setExifResponse,
    onDownloadClick,
    onGetExifData,
    onDeleteClick,
  } = props

  const { t } = useTranslation()

  const { userConfig: { kiloSize } } = useUserConfig()

  const [sizeInfo, setSizeInfo] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (imgEl) {
      imgEl.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = imgEl
        setSizeInfo({ width, height })
      }
    }
  }, [imgEl, activeEntry])

  useEffect(() => {
    setExifResponse(null)
  }, [activeIndex, setExifResponse])

  const buttonList = useMemo(() => {
    return [
      {
        icon: <SvgIcon.BottomSlider size={14} />,
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
        onClick: onDownloadClick,
      },
      {
        icon: <SvgIcon.Info size={14} />,
        title: t`action.exifInfo`,
        disabled: !activeEntry || !['jpg', 'jpeg'].includes(activeEntry.extension) || queryingExifData,
        onClick: onGetExifData,
      },
      {
        icon: <SvgIcon.Delete size={14} />,
        title: t`action.delete`,
        disabled: !activeEntry,
        onClick: onDeleteClick,
      },
    ]
  }, [
    t,
    matchedEntryList,
    activeEntry,
    onGetExifData,
    setThumbnailListShow,
    thumbnailListShow,
    setIsLight,
    isLight,
    onDownloadClick,
    onDeleteClick,
    queryingExifData,
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
          {sizeInfo.width} &times; {sizeInfo.height}PX
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
          {getReadableSize(activeEntry?.size || 0, kiloSize)}
        </div>
      </div>

      <div
        className={line(`
          absolute z-20 inset-0
          text-xs text-white break-words cursor-default
          bg-gray-700 bg-opacity-70 backdrop-blur
          transition-transform duration-200
          ${exifResponse ? 'scale-100' : 'scale-0'}
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
        {exifResponse && (
          <IconButton
            icon={<SvgIcon.Close size={12} />}
            size="sm"
            onClick={() => setExifResponse(null)}
            className="absolute z-10 top-1 right-1"
          />
        )}
        <div className="absolute z-0 inset-0 pb-4 overflow-y-auto text-xs select-text">
          {Object.entries(exifResponse?.data || {}).map(([key, value]) => (
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
