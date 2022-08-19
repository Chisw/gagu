import { useEffect, useMemo, useRef, useState } from 'react'
import { EntryType, IEntry, IEntryIcon } from '../../utils/types'
import { get } from 'lodash'
import { GEN_THUMBNAIL_LIST, GEN_THUMBNAIL_VIDEO_LIST, line } from '../../utils'
import { FsApi } from '../../api'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import { SvgIcon  } from '../../components/base'
import useFetch from '../../hooks/useFetch'

const DEFAULT_ENTRY_ICON: IEntryIcon = {
  type: 'unknown',
  icon: <SvgIcon.Unknown />,
  iconClassName: 'text-gray-500 bg-gray-200',
  matchList: [],
}

const FOLDER_ICON_LIST: IEntryIcon[] = [
  {
    type: 'folder',
    icon: '',
    iconClassName: '--folder',
    matchList: ['_dir'],
  },
  {
    type: 'folder',
    icon: '',
    iconClassName: '--folder --empty',
    matchList: ['_dir_empty'],
  },
  {
    type: 'folder',
    icon: '',
    iconClassName: '--folder --empty opacity-50',
    matchList: ['_dir_new'],
  },
]

const ENTRY_ICON_LIST: IEntryIcon[] = [
  {
    type: 'document',
    icon: <SvgIcon.Document />,
    iconClassName: 'text-gray-500 bg-gray-100 border-gray-300',
    matchList: ['_txt_new', 'txt', 'md'],
  },
  {
    type: 'pdf',
    icon: <SvgIcon.PDF />,
    iconClassName: '--file --pdf',
    matchList: ['pdf'],
  },
  {
    type: 'code',
    icon: <SvgIcon.CodeSlash />,
    iconClassName: '--file --code',
    matchList: ['html', 'css', 'js', 'php'],
  },
  {
    type: 'data',
    icon: <SvgIcon.Database />,
    iconClassName: 'text-gray-700 bg-gray-100 border-gray-300',
    matchList: ['dat', 'db', 'sql', 'json', 'log'],
  },
  {
    type: 'image',
    icon: <SvgIcon.Image />,
    iconClassName: 'text-orange-500 bg-orange-100 border-orange-200',
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico'],
  },
  {
    type: 'audio',
    icon: <SvgIcon.Music />,
    iconClassName: '--file --music',
    matchList: ['mp3', 'flac', 'wav', 'aac'],
  },
  {
    type: 'video',
    icon: <SvgIcon.Film />,
    iconClassName: 'text-blue-500 bg-blue-100 border-blue-200',
    matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb'],
  },
  {
    type: 'archive',
    icon: <SvgIcon.Zip />,
    iconClassName: 'text-amber-700 bg-amber-100 border-amber-300',
    matchList: ['zip', 'rar', '.7z'],
  },
  {
    type: 'application',
    icon: <SvgIcon.Application />,
    iconClassName: 'text-lime-600 bg-lime-100 border-lime-300',
    matchList: ['apk'],
  },
]

const DIR_SUB_ICON_MAP = {
  'alipay': <SvgIcon.Alipay />,
  'android': <SvgIcon.Android />,
  'applications': <SvgIcon.Application />,
  // 'autonavi': dirAutonavi,
  // 'backups': dirBackup,
  'baidu': <SvgIcon.Baidu />,
  // 'browser': dirBrowser,
  'camera': <SvgIcon.Camera />,
  'dcim': <SvgIcon.Camera />,
  // 'duoKan': dirDuokan,
  'desktop': <SvgIcon.Computer />,
  'document': <SvgIcon.FileText />,
  'documents': <SvgIcon.FileText />,
  'download': <SvgIcon.Download />,
  'downloads': <SvgIcon.Download />,
  'font': <SvgIcon.FontSize />,
  'fonts': <SvgIcon.FontSize />,
  'movies': <SvgIcon.Film />,
  'music': <SvgIcon.Music />,
  'pictures': <SvgIcon.Image />,
  'public': <SvgIcon.Walk />,
  // 'retroarch': dirRetroArch,
  'qq': <SvgIcon.QQ />,
  'tencent': <SvgIcon.QQ />,
  // 'miui': dirMi,
  'wechat': <SvgIcon.Wechat />,
  'weixin': <SvgIcon.Wechat />,
}

const getIconInfo = (entry: IEntry, small: boolean) => {
  const { name, type, extension } = entry
  const isDir = type === EntryType.directory
  const entryIcon = extension
    ? (([
      ...FOLDER_ICON_LIST,
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

  const [thumbnailError, setThumbnailError] = useState(false)
  const [isInView, setIsInView] = useState(false)

  const iconRef = useRef<any>(null)

  const { fetch, data: base64 } = useFetch(FsApi.getThumbnailBase64)

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

  const showThumbnail = useMemo(() => {
    return !virtual && useThumbnail && !thumbnailError && isInView
  }, [virtual, useThumbnail, thumbnailError, isInView])

  useEffect(() => {
    showThumbnail && fetch(`${parentPath}/${name}`)
  }, [showThumbnail, fetch, parentPath, name])

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
    <div
      ref={iconRef}
      className="flex justify-center items-center pointer-events-none"
    >
      {(showThumbnail && isInView && base64) ? (
        <div
          className={line(`
            relative flex justify-center items-center
            ${small ? 'w-7 h-6' : 'w-18 h-12'}
            ${isVideo ? 'bg-black rounded-sm' : ''}
          `)}
        >
          <img
            alt={entry.name}
            className={line(`
              max-w-full max-h-full bg-white shadow-md
              ${isVideo ? '' : `border ${small ? 'p-1px' : 'p-2px'}`}
            `)}
            src={base64}
            onError={() => setThumbnailError(true)}
          />
          {FileSubIcon}
        </div>
      ) : (
        <div
          className={line(`
            entry-icon
            relative flex justify-center items-center
            ${(isDir && small) ? 'w-7 h-6' : ''}
            ${(isDir && !small) ? 'w-14 h-12' : ''}
            ${(!isDir && small) ? 'w-5 h-6' : ''}
            ${(!isDir && !small) ? 'w-10 h-12' : ''}
            ${small ? '--no-ext' : ''}
            ${iconClassName}
          `)}
          data-ext={extension.replace('_txt_new', 'txt').substring(0, 4)}
        >
          {icon}
          {DirSubIcon}
          {FileSubIcon}
        </div>
      )}
    </div>
  )
}
