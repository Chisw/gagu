import { useEffect, useMemo, useRef, useState } from 'react'
import { EntryType, IEntry } from '../../utils/types'
import { ENTRY_ICON_LIST, GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../utils'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import { FsApi } from '../../api'
import { useFetch } from '../../hooks'

interface IconProps {
  entry: IEntry
  isSmall?: boolean
  scrollHook?: { top: number, height: number }
}

export default function Icon(props: IconProps) {
  const {
    entry,
    isSmall = false,
    scrollHook,
  } = props

  const [isInView, setIsInView] = useState(false)
  const [thumbnailErr, setThumbnailErr] = useState(false)

  const iconRef = useRef<any>(null)

  const { fetch, data: thumbnailBase64, loading } = useFetch(FsApi.getThumbnailBase64)

  useEffect(() => {
    const icon: any = iconRef.current
    if (!icon || !scrollHook) return
    const { top, height } = scrollHook
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsInView(true)
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

  const requestThumbnail = useMemo(() => {
    return useThumbnail && isInView
  }, [useThumbnail, isInView])

  useEffect(() => {
    const { parentPath, name } = entry
    requestThumbnail && fetch(`${parentPath}/${name}`)
  }, [requestThumbnail, fetch, entry])

  const showThumbnail = useMemo(() => {
    return requestThumbnail && !thumbnailErr
  }, [requestThumbnail, thumbnailErr])

  return (
    <div
      ref={iconRef}
      data-extension-label={extensionLabel}
      data-folder-name={isFolder ? entry.name.toLowerCase() : undefined}
      data-show-thumbnail={String(showThumbnail)}
      className={line(`
        gg-entry-icon
        relative mx-auto max-w-16 pointer-events-none
        flex justify-center items-center flex-shrink-0
        bg-no-repeat bg-contain bg-center
        ${isSmall ? 'w-6 h-6 --small-icon' : 'h-12'}
        ${isFolder ? '--e-folder' : '--e-file'}
        ${`--i-${entryIconType || 'unknown'}`}
      `)}
    >
      {callableAppId && (
        <div
          data-app-id={callableAppId}
          className={line(`
            gg-app-icon absolute z-0 right-0 bottom-0 left-1/2 w-3 h-3 rounded-sm shadow-sm
            ${isSmall ? 'ml-2px' : 'ml-4'}
          `)}
        />
      )}
      {showThumbnail && (
        <img
          alt=""
          src={thumbnailBase64}
          onError={() => setThumbnailErr(true)}
          className={line(`
            max-w-full max-h-full
            ${loading
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
