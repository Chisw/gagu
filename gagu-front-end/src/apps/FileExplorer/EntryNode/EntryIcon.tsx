import { ReactNode, useMemo, useState } from 'react'
import { EntryType, IEntry, ThumbnailType, ThumbnailTypeType } from '../../../types'
import { ENTRY_ICON_LIST, GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_MAP, line } from '../../../utils'
import { CALLABLE_APP_LIST } from '../..'
import { FsApi } from '../../../api'

interface IconProps {
  entry: IEntry
  isSmall?: boolean
  isFavorited?: boolean
  isViewable?: boolean
  hideAppIcon?: boolean
  supportThumbnail?: boolean
  touchMode?: boolean
}

export default function EntryIcon(props: IconProps) {
  const {
    entry,
    isSmall = false,
    isFavorited = false,
    isViewable = false,
    hideAppIcon = false,
    supportThumbnail = false,
    touchMode = false,
  } = props

  const [thumbnailErr, setThumbnailErr] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(true)

  const { extensionLabel, useThumbnail, thumbnailType, isFolder, entryIconType, callableAppId } = useMemo(() => {
    const { extension, type } = entry
    const useThumbnail = GEN_THUMBNAIL_LIST.includes(extension)
    const isFolder = type === EntryType.directory
    const extensionLabel = isFolder
      ? ''
      : (extension.replace('_txt_new', 'txt')
        .substring(0, 5)
        .split('')
        .filter(s => s.match(/[A-Za-z0-9]/))
        .join('') || 'N/A'
      )
    const entryIconType = ENTRY_ICON_LIST.find(o => o.matchList.includes(extension))?.type
    const callableAppId = CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))?.id
    const thumbnailType = GEN_THUMBNAIL_MAP[extension]
    return { extensionLabel, useThumbnail, thumbnailType, isFolder, entryIconType, callableAppId }
  }, [entry])

  const showThumbnail = useMemo(() => {
    return supportThumbnail && useThumbnail && isViewable && !thumbnailErr
  }, [supportThumbnail, useThumbnail, isViewable, thumbnailErr])

  return (
    <div
      data-extension-label={extensionLabel}
      data-folder-name={isFolder ? entry.name.toLowerCase() : undefined}
      data-show-thumbnail={String(showThumbnail)}
      className={line(`
        gagu-entry-icon
        relative mx-auto pointer-events-none
        flex justify-center items-center flex-shrink-0
        bg-no-repeat bg-contain bg-center
        ${isSmall ? 'w-6 h-6 --small-icon' : 'w-14 h-12'}
        ${isFolder ? '--folder' : '--file'}
        ${isFavorited ? '--is-favorited' : ''}
        ${`--i-${entryIconType || 'unknown'}`}
      `)}
    >
      {(!hideAppIcon && callableAppId) && (
        <div
          data-app-id={callableAppId}
          className={line(`
            gagu-app-icon absolute z-0 right-0 bottom-0 left-1/2 rounded-sm shadow-sm
            transition-opacity duration-200
            ${touchMode ? '' : 'opacity-0 group-hover:opacity-100'}
            ${isSmall ? 'ml-[4px] w-[8px] h-[8px]' : 'ml-4 w-[12px] h-[12px]'}
          `)}
        />
      )}
      {showThumbnail && (
        <ThumbnailWrapper type={thumbnailType} loading={thumbnailLoading}>
          <img
            alt=""
            src={FsApi.getThumbnailStreamUrl(entry)}
            className={line(`
              max-w-full max-h-full bg-white
              ${thumbnailType === ThumbnailType.document
                ? `
                  border border-r-2 border-b-2 border-gray-200 dark:border-zinc-500
                  ${thumbnailLoading ? 'h-full aspect-[3/4] bg-loading' : ''}
                `
                : ''
              }
              ${thumbnailType === ThumbnailType.image
                ? `
                  border-white shadow
                  dark:border-zinc-400
                  ${isSmall ? 'border' : 'border-2'}
                  ${thumbnailLoading ? 'h-full aspect-square bg-loading' : ''}
                `
                : ''}
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

function ThumbnailWrapper(props: { type: ThumbnailTypeType, loading: boolean, children: ReactNode }) {
  const { type, loading, children } = props
  if (type === ThumbnailType.video) {
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
  } else if (type === ThumbnailType.audio) {
    return (
      <div
        className={line(`
          relative w-4/5 aspect-square flex justify-center items-center shadow-lg overflow-hidden
          after:content-[''] after:block after:absolute after:z-[0] after:left-0
          after:-ml-[60%] after:-mt-[70%] after:w-full after:h-[300%]
          after:bg-white after:bg-opacity-30 after:rotate-[60deg]
          ${loading ? 'bg-loading' : 'bg-white'}
        `)}
      >
        {children}
      </div>
    )
  } else {
    return <>{children}</>
  }
}
