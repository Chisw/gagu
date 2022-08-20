import { useEffect, useMemo, useRef, useState } from 'react'
import { EntryType, IEntry } from '../../utils/types'
import { GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../utils'
import { FsApi } from '../../api'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import useFetch from '../../hooks/useFetch'

interface IEntryIcon {
  type: string
  matchList: string[]
}

const DEFAULT_ENTRY_ICON: IEntryIcon = { type: 'unknown', matchList: [] }

const ENTRY_ICON_LIST: IEntryIcon[] = [
  { type: 'folder', matchList: ['_dir'] },
  { type: 'folder-empty', matchList: ['_dir_new', '_dir_empty'] },
  { type: 'document', matchList: ['_txt_new', 'txt', 'md'] },
  { type: 'pdf', matchList: ['pdf'] },
  { type: 'code', matchList: ['html', 'css', 'js', 'php'] },
  { type: 'data', matchList: ['dat', 'db', 'sql', 'json', 'log'] },
  { type: 'image', matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico'] },
  { type: 'audio', matchList: ['mp3', 'flac', 'wav', 'aac'] },
  { type: 'video', matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb'] },
  { type: 'archive', matchList: ['zip', 'rar', '.7z'] },
  { type: 'application', matchList: ['apk'] },
]

const getIconData = (extension: string, isDir: boolean) => {
  const entryIcon = extension
    ? (ENTRY_ICON_LIST.find(o => o.matchList.includes(extension)) || DEFAULT_ENTRY_ICON)
    : DEFAULT_ENTRY_ICON

  const callableIcon = isDir
    ? undefined
    : CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))?.icon

  return { isDir, entryIcon, callableIcon }
}

interface IconProps {
  entry: IEntry
  virtual?: boolean
  small?: boolean
  scrollHook?: { top: number, height: number }
}

export default function Icon(props: IconProps) {

  const {
    entry: {
      name,
      type,
      extension,
      parentPath,
    },
    virtual = false,
    small = false,
    scrollHook,
  } = props

  const [isInView, setIsInView] = useState(false)

  const iconRef = useRef<any>(null)

  const { fetch, data: base64, loading } = useFetch(FsApi.getThumbnailBase64)

  useEffect(() => {
    const icon: any = iconRef.current
    if (!icon || !scrollHook) return
    const { top, height } = scrollHook
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsInView(true)
    }
  }, [scrollHook])

  const { ext, useThumbnail, isVideo, isDir, entryIconType, callableIcon } = useMemo(() => {
    const useThumbnail = extension && GEN_THUMBNAIL_LIST.includes(extension)
    const isVideo = extension && GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
    const ext = extension.replace('_txt_new', 'txt').substring(0, 4) || 'N/A'
    const { isDir, entryIcon: { type: entryIconType }, callableIcon } = getIconData(extension, type === EntryType.directory)
    return { ext, useThumbnail, isVideo, isDir, entryIconType, callableIcon }
  }, [extension, type])

  const showThumbnail = useMemo(() => {
    return !virtual && useThumbnail && isInView
  }, [virtual, useThumbnail, isInView])

  useEffect(() => {
    showThumbnail && fetch(`${parentPath}/${name}`)
  }, [showThumbnail, fetch, parentPath, name])

  return (
    <div
      ref={iconRef}
      data-ext={ext}
      data-folder-name={isDir ? name.toLowerCase() : undefined}
      data-show-thumbnail={showThumbnail ? 'true' : 'false'}
      className={line(`
        entry-icon
        ${isDir ? '--folder' : '--file'}
        ${small ? '--small-icon' : ''}
        ${`--${entryIconType}`}
      `)}
    >
      {callableIcon && (
        <div
          className={line(`
            absolute z-10 right-0 bg-center bg-no-repeat bg-contain
            border border-white rounded shadow
            ${small ? 'bottom-0 w-3 h-3' : 'top-0 w-4 h-4'}
          `)}
          style={{ backgroundImage: `url("${callableIcon}")` }}
        />
      )}
      {showThumbnail && (
        <img
          alt=""
          src={base64}
          className={line(`
            max-w-full max-h-full
            ${loading
              ? 'w-6 h-6 bg-loading'
              : isVideo
                ? 'border-l-4 border-r-4 border-black rounded-sm'
                : 'border-2 border-white shadow'
            }
          `)}
        />
      )}
    </div>
  )
}
