import { useEffect, useMemo, useRef, useState } from 'react'
import { EntryType, IEntry } from '../../types'
import { ENTRY_ICON_LIST, GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../utils'
import { CALLABLE_APP_LIST } from '..'
import { FsApi } from '../../api'

interface IconProps {
  entry: IEntry
  isSmall?: boolean
  scrollHook?: { top: number, height: number }
  hideApp?: boolean
  thumbnailSupported?: boolean
}

export default function Icon(props: IconProps) {
  const {
    entry,
    isSmall = false,
    scrollHook,
    hideApp = false,
    thumbnailSupported = false,
  } = props

  const [isViewable, setIsViewable] = useState(false)
  const [thumbnailErr, setThumbnailErr] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(false)

  const iconRef = useRef<any>(null)

  useEffect(() => {
    const icon: any = iconRef.current
    if (!icon || !scrollHook) return
    const { top, height } = scrollHook
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsViewable(true)
    }
  }, [scrollHook])

  const { extensionLabel, useThumbnail, isVideo, isFolder, entryIconType, callableAppId } = useMemo(() => {
    const { extension, type } = entry
    const useThumbnail = GEN_THUMBNAIL_LIST.includes(extension)
    const isVideo = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
    const isFolder = type === EntryType.directory
    const extensionLabel = isFolder ? '' : (extension.replace('_txt_new', 'txt').substring(0, 4) || 'N/A')
    const entryIconType = ENTRY_ICON_LIST.find(o => o.matchList.includes(extension))?.type
    const callableAppId = CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))?.id
    return { extensionLabel, useThumbnail, isVideo, isFolder, entryIconType, callableAppId }
  }, [entry])

  const showThumbnail = useMemo(() => {
    return thumbnailSupported && useThumbnail && isViewable && !thumbnailErr
  }, [thumbnailSupported, useThumbnail, isViewable, thumbnailErr])

  return (
    <div
      ref={iconRef}
      data-extension-label={extensionLabel}
      data-folder-name={isFolder ? entry.name.toLowerCase() : undefined}
      data-show-thumbnail={String(showThumbnail)}
      className={line(`
        gagu-entry-icon
        relative mx-auto max-w-16 pointer-events-none
        flex justify-center items-center flex-shrink-0
        bg-no-repeat bg-contain bg-center
        ${isSmall ? 'w-6 h-6 --small-icon' : 'h-12'}
        ${isFolder ? '--entry-folder' : '--entry-file'}
        ${`--icon-${entryIconType || 'unknown'}`}
      `)}
    >
      {(!hideApp && callableAppId) && (
        <div
          data-app-id={callableAppId}
          className={line(`
            gagu-app-icon absolute z-0 right-0 bottom-0 left-1/2 w-3 h-3 rounded-sm shadow-sm
            ${isSmall ? 'ml-2px' : 'ml-4'}
          `)}
        />
      )}
      {showThumbnail && (
        <img
          alt=""
          src={FsApi.getThumbnailUrl(entry)}
          onError={() => {
            setThumbnailErr(true)
            setThumbnailLoading(false)
          }}
          onLoadStart={() => setThumbnailLoading(true)}
          onLoad={() => setThumbnailLoading(false)}
          className={line(`
            max-w-full max-h-full
            ${thumbnailLoading
              ? 'w-6 h-6 bg-loading'
              : isVideo
                ? `${isSmall ? 'border-l-2 border-r-2' : 'border-l-4 border-r-4'} border-black rounded-sm`
                : `${isSmall ? 'border' : 'border-2'} border-white shadow`
            }
          `)}
        />
      )}
    </div>
  )
}
