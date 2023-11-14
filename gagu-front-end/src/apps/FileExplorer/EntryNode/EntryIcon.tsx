import { ReactNode, useMemo, useState } from 'react'
import { EntryType, IEntry, ThumbnailType } from '../../../types'
import { ENTRY_ICON_LIST, GEN_THUMBNAIL_AUDIO_LIST, GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../../utils'
import { CALLABLE_APP_LIST } from '../..'
import { FsApi } from '../../../api'

interface IconProps {
  entry: IEntry
  isSmall?: boolean
  isFavorited?: boolean
  isViewable?: boolean
  hideApp?: boolean
  supportThumbnail?: boolean
}

export default function EntryIcon(props: IconProps) {
  const {
    entry,
    isSmall = false,
    isFavorited = false,
    isViewable = false,
    hideApp = false,
    supportThumbnail = false,
  } = props

  const [thumbnailErr, setThumbnailErr] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(true)

  const { extensionLabel, useThumbnail, thumbnailType, isFolder, entryIconType, callableAppId } = useMemo(() => {
    const { extension, type } = entry
    const useThumbnail = GEN_THUMBNAIL_LIST.includes(extension)
    const isFolder = type === EntryType.directory
    const extensionLabel = isFolder ? '' : (extension.replace('_txt_new', 'txt').substring(0, 4) || 'N/A')
    const entryIconType = ENTRY_ICON_LIST.find(o => o.matchList.includes(extension))?.type
    const callableAppId = CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))?.id
    const thumbnailType: ThumbnailType = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
      ? 'video'
      : GEN_THUMBNAIL_AUDIO_LIST.includes(extension)
        ? 'audio'
        : 'image'
    return { extensionLabel, useThumbnail, thumbnailType, isFolder, entryIconType, callableAppId }
  }, [entry])

  const showThumbnail = useMemo(() => {
    return supportThumbnail && useThumbnail && isViewable && !thumbnailErr
  }, [supportThumbnail, useThumbnail, isViewable, thumbnailErr])

  const imageThumbnailClassName = useMemo(() => {
    return thumbnailType === 'image'
    ? `border-white shadow ${isSmall ? 'border' : 'border-2'} ${thumbnailLoading ? 'h-full aspect-square bg-loading' : ''}`
    : ''
  }, [thumbnailType, isSmall, thumbnailLoading])

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
        ${isFavorited ? '--is-favorited' : ''}
        ${`--icon-${entryIconType || 'unknown'}`}
      `)}
    >
      {(!hideApp && callableAppId) && (
        <div
          data-app-id={callableAppId}
          className={line(`
            gagu-app-icon absolute z-0 right-0 bottom-0 left-1/2 rounded-sm shadow-sm
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            ${isSmall ? 'ml-[4px] w-[8px] h-[8px]' : 'ml-4 w-[12px] h-[12px]'}
          `)}
        />
      )}
      {showThumbnail && (
        <ThumbnailWrapper type={thumbnailType} loading={thumbnailLoading}>
          <img
            alt=""
            src={FsApi.getThumbnailUrl(entry)}
            className={line(`max-w-full max-h-full bg-white ${imageThumbnailClassName}`)}
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

function ThumbnailWrapper(props: { type: ThumbnailType, loading: boolean, children: ReactNode }) {
  const { type, loading, children } = props
  if (type === 'video') {
    return (
      <div
        className={line(`
          px-[2px] w-full aspect-[16/9] flex justify-center items-center shadow-lg
          ${loading ? 'bg-loading' : 'bg-black'}
        `)}
      >
        {children}
      </div>
    )
  } else if (type === 'audio') {
    return (
      <div
        className={line(`
          relative w-4/5 aspect-square flex justify-center items-center shadow-lg overflow-hidden rounded-sm
          after:content-[''] after:block after:absolute after:z-[0] after:left-0
          after:-ml-[60%] after:-mt-[70%] after:w-full after:h-[300%] after:bg-white after:bg-opacity-30
          ${loading ? 'bg-loading' : 'bg-white'}
          after:rotate-[60deg]
        `)}
      >
        {children}
      </div>
    )
  } else {
    return <>{children}</>
  }
}
