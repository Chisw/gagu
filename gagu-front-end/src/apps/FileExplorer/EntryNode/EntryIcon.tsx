import { ReactNode, useMemo, useState } from 'react'
import { EntryType, IEntry } from '../../../types'
import { ENTRY_ICON_LIST, GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../../utils'
import { CALLABLE_APP_LIST } from '../..'
import { FsApi } from '../../../api'

interface IconProps {
  entry: IEntry
  isSmall?: boolean
  isViewable?: boolean
  hideApp?: boolean
  thumbnailSupported?: boolean
}

export default function EntryIcon(props: IconProps) {
  const {
    entry,
    isSmall = false,
    isViewable = false,
    hideApp = false,
    thumbnailSupported = false,
  } = props

  const [thumbnailErr, setThumbnailErr] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(true)

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
      data-extension-label={extensionLabel}
      data-folder-name={isFolder ? entry.name.toLowerCase() : undefined}
      data-show-thumbnail={String(showThumbnail)}
      className={line(`
        gagu-entry-icon
        relative mx-auto max-w-[4rem] pointer-events-none
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
            gagu-app-icon absolute z-0 right-0 bottom-0 left-1/2 rounded-sm shadow-sm
            ${isSmall ? 'ml-[4px] w-[8px] h-[8px]' : 'ml-4 w-[10px] h-[10px]'}
          `)}
        />
      )}
      {showThumbnail && (
        <ThumbnailWrapper isVideo={isVideo}>
          <img
            alt=""
            src={FsApi.getThumbnailUrl(entry)}
            className={line(`
              max-w-full max-h-full bg-white
              ${thumbnailLoading
                ? 'w-6 h-6 bg-loading'
                : isVideo ? '' : `${isSmall ? 'border' : 'border-2'} border-white shadow`
              }
            `)}
            onLoad={() => setThumbnailLoading(false)}
            onError={() => {
              setThumbnailErr(true)
              setThumbnailLoading(false)
            }}
          />
        </ThumbnailWrapper>
      )}
    </div>
  )
}

function ThumbnailWrapper(props: { isVideo: boolean, children: ReactNode }) {
  const { isVideo, children } = props
  return isVideo ? (
    <div className="px-[2px] w-full aspect-[16/9] bg-black flex justify-center items-center">
      {children}
    </div>
  ) : (
    <>{children}</>
  )
}
