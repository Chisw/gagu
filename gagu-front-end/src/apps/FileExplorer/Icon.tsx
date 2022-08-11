import { useEffect, useMemo, useRef, useState } from 'react'
import { IEntry, IEntryIcon } from '../../utils/types'
import { get } from 'lodash'
import { GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../utils'
import { FsApi } from '../../api'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import RemixIcon from '../../img/remixicon'

const DEFAULT_ENTRY_ICON: IEntryIcon = {
  type: 'unknown',
  icon: <RemixIcon.Unknown />,
  iconClassName: 'text-gray-500 bg-gray-200 border-gray-200',
  matchList: [],
}

const SMALL_FOLDER_ICON_LIST: IEntryIcon[] = [
  {
    type: 'folder',
    icon: <RemixIcon.FolderFillFiles size={24} />,
    iconClassName: 'border-none',
    matchList: ['_dir'],
  },
  {
    type: 'folder',
    icon: <RemixIcon.FolderFill size={24} />,
    iconClassName: 'border-none',
    matchList: ['_dir_empty'],
  },
  {
    type: 'folder',
    icon: <RemixIcon.FolderFill size={24} />,
    iconClassName: 'border-none opacity-50',
    matchList: ['_dir_new'],
  },
]

const LARGE_FOLDER_ICON_LIST: IEntryIcon[] = [
  {
    type: 'folder',
    icon: <RemixIcon.FolderFillFiles size={56} />,
    iconClassName: 'border-none',
    matchList: ['_dir'],
  },
  {
    type: 'folder',
    icon: <RemixIcon.FolderFill size={56} />,
    iconClassName: 'border-none',
    matchList: ['_dir_empty'],
  },
  {
    type: 'folder',
    icon: <RemixIcon.FolderFill size={56} />,
    iconClassName: 'border-none opacity-50',
    matchList: ['_dir_new'],
  },
]

const ENTRY_ICON_LIST: IEntryIcon[] = [
  {
    type: 'document',
    icon: <RemixIcon.Document />,
    iconClassName: 'text-gray-500 bg-gray-100 border-gray-300',
    matchList: ['_txt_new', 'txt', 'md'],
  },
  {
    type: 'pdf',
    icon: <RemixIcon.PDF />,
    iconClassName: 'text-red-900 bg-red-100 border-red-200',
    matchList: ['pdf'],
  },
  {
    type: 'code',
    icon: <RemixIcon.CodeSlash />,
    iconClassName: 'text-green-400 bg-black-900 border-green-600',
    matchList: ['html', 'css', 'js', 'php'],
  },
  {
    type: 'data',
    icon: <RemixIcon.Database />,
    iconClassName: 'text-gray-700 bg-gray-100 border-gray-300',
    matchList: ['dat', 'db', 'sql', 'json', 'log'],
  },
  {
    type: 'image',
    icon: <RemixIcon.Image />,
    iconClassName: 'text-orange-500 bg-orange-100 border-orange-200',
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico'],
  },
  {
    type: 'audio',
    icon: <RemixIcon.Music />,
    iconClassName: 'text-pink-700 bg-pink-100 border-pink-200',
    matchList: ['mp3', 'flac', 'wav', 'aac'],
  },
  {
    type: 'video',
    icon: <RemixIcon.Film />,
    iconClassName: 'text-blue-500 bg-blue-100 border-blue-200',
    matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb'],
  },
  {
    type: 'archive',
    icon: <RemixIcon.Zip />,
    iconClassName: 'text-amber-700 bg-amber-100 border-amber-300',
    matchList: ['zip', 'rar', '.7z'],
  },
  {
    type: 'application',
    icon: <RemixIcon.Application />,
    iconClassName: 'text-lime-600 bg-lime-100 border-lime-300',
    matchList: ['apk'],
  },
]

const DIR_SUB_ICON_MAP = {
  'alipay': <RemixIcon.Alipay />,
  'android': <RemixIcon.Android />,
  'applications': <RemixIcon.Application />,
  // 'autonavi': dirAutonavi,
  // 'backups': dirBackup,
  'baidu': <RemixIcon.Baidu />,
  // 'browser': dirBrowser,
  'camera': <RemixIcon.Camera />,
  'dcim': <RemixIcon.Camera />,
  // 'duoKan': dirDuokan,
  'desktop': <RemixIcon.Computer />,
  'document': <RemixIcon.FileText />,
  'documents': <RemixIcon.FileText />,
  'download': <RemixIcon.Download />,
  'downloads': <RemixIcon.Download />,
  'font': <RemixIcon.FontSize />,
  'fonts': <RemixIcon.FontSize />,
  'movies': <RemixIcon.Film />,
  'music': <RemixIcon.Music />,
  'pictures': <RemixIcon.Image />,
  'public': <RemixIcon.Walk />,
  // 'retroarch': dirRetroArch,
  'qq': <RemixIcon.QQ />,
  'tencent': <RemixIcon.QQ />,
  // 'miui': dirMi,
  'wechat': <RemixIcon.Wechat />,
  'weixin': <RemixIcon.Wechat />,
}

const getIconInfo = (entry: IEntry, small: boolean) => {
  const { name, type, extension } = entry
  const isDir = type === 'directory'
  const entryIcon = extension
    ? (([
      ...(small ? SMALL_FOLDER_ICON_LIST : LARGE_FOLDER_ICON_LIST),
      ...ENTRY_ICON_LIST,
    ]).find(o => o.matchList.includes(extension)) || DEFAULT_ENTRY_ICON)
    : DEFAULT_ENTRY_ICON

  const dirSubIcon = isDir
    ? get(DIR_SUB_ICON_MAP, name.toLowerCase())
    : undefined

  const fileSubIcon = isDir
    ? undefined
    : CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension!))?.icon

  return { isDir, entryIcon, dirSubIcon, fileSubIcon }
}

interface IconProps {
  entry: IEntry
  virtual?: boolean
  small?: boolean
  scrollHook?: { top: number, height: number }
}

export default function Icon(props: IconProps) {

  const {
    entry,
    virtual = false,
    small = false,
    scrollHook,
  } = props

  const { name, parentPath, extension } = entry

  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [isInView, setIsInView] = useState(false)

  const iconRef = useRef<any>(null)

  useEffect(() => {
    const icon: any = iconRef.current
    if (!icon || !scrollHook) return
    const { top, height } = scrollHook
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsInView(true)
    }
  }, [scrollHook])

  const {
    useThumbnail, isVideo, isDir,
    icon, iconClassName, dirSubIcon, fileSubIcon,
  } = useMemo(() => {
    const { extension } = entry
    const useThumbnail = extension && GEN_THUMBNAIL_LIST.includes(extension)
    const isVideo = extension && GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
    const { isDir, entryIcon: { icon, iconClassName }, dirSubIcon, fileSubIcon } = getIconInfo(entry, small)
    return {
      useThumbnail, isVideo, isDir,
      icon, iconClassName, dirSubIcon, fileSubIcon,
    }
  }, [entry, small])

  const showThumbnail = !virtual && useThumbnail && !thumbnailError

  const DirSubIcon = dirSubIcon && (
    <div
      className={line(`
        absolute top-1/2 left-1/2 mt-1px w-5 h-5
        flex justify-center items-center
        transform -translate-x-1/2 -translate-y-1/2
        text-yellow-600
        ${small ? 'scale-50' : ''}
      `)}
    >
      {dirSubIcon}
    </div>
  )

  const FileSubIcon = fileSubIcon && (
    <div
      className={line(`
        absolute right-0 bottom-0 bg-center bg-no-repeat bg-contain
        border border-white rounded shadow
        ${small ? 'w-3 h-3 -m-2px' : '-m-2 w-4 h-4'}
      `)}
      style={{ backgroundImage: `url("${fileSubIcon}")` }}
    />
  )

  return (
    <div ref={iconRef} className="flex justify-center items-center pointer-events-none">
      {(showThumbnail && isInView) ? (
        <div
          className={line(`
            relative flex justify-center items-center
            ${small ? 'w-7 h-6' : 'w-18 h-12'}
            ${thumbnailLoaded ? (isVideo ? 'bg-black rounded-sm' : '') : 'bg-loading'}
          `)}
        >
          <img
            alt={entry.name}
            className={line(`
              max-w-full max-h-full bg-white shadow-md
              ${isVideo ? '' : `border ${small ? 'p-1px' : 'p-2px'}`}
            `)}
            src={FsApi.getThumbnailUrl(`${parentPath}/${name}`)}
            onLoad={() => setThumbnailLoaded(true)}
            onError={() => setThumbnailError(true)}
          />
          {FileSubIcon}
        </div>
      ) : (
        <div
          className={line(`
            relative flex justify-center items-center
            ${small ? 'px-2px' : ''}
            ${(isDir || small) ? 'border' : 'border-2'}
            ${(isDir && small)   ? 'w-7  h-6  rounded' : ''}
            ${(isDir && !small)  ? 'w-14 h-12 rounded-lg' : ''}
            ${(!isDir && small)  ? 'w-5  h-6  rounded-sm rounded-tr mx-1' : ''}
            ${(!isDir && !small) ? 'w-10 h-12 rounded rounded-tr-lg' : ''}
            ${iconClassName}
          `)}
        >
          {small ? icon : (
            <div>
              <div className="text-center">{icon}</div>
              {!isDir && (
                <div className="mt-2px font-din text-center text-xs">
                  {extension?.replace('_txt_new', 'txt').substring(0, 4).toUpperCase()}
                </div>
              )}
            </div>
          )}
          {DirSubIcon}
          {FileSubIcon}
        </div>
      )}
    </div>
  )
}
