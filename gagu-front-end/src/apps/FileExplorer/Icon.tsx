import { Application20, DataBase20, Document20, Help20, Folder32, Image20, Music20, Pen20, Video20, Box20, Code20 } from '@carbon/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IEntry, IEntryIcon } from '../../utils/types'
import dirAndroid from '../../img/icons/dir-android.png'
import dirAlipay from '../../img/icons/dir-alipay.png'
import dirAutonavi from '../../img/icons/dir-autonavi.png'
import dirBackup from '../../img/icons/dir-backup.png'
import dirBaidu from '../../img/icons/dir-baidu.png'
import dirBrowser from '../../img/icons/dir-browser.png'
import dirCamera from '../../img/icons/dir-camera.png'
import dirDownload from '../../img/icons/dir-download.png'
import dirDuokan from '../../img/icons/dir-duokan.png'
import dirFonts from '../../img/icons/dir-fonts.png'
import dirMovies from '../../img/icons/app-video-player.png'
import dirMusic from '../../img/icons/app-music-player.png'
import dirPictures from '../../img/icons/app-photo-gallery.png'
import dirRetroArch from '../../img/icons/dir-retroarch.png'
import dirSogou from '../../img/icons/dir-sogou.png'
import dirTencent from '../../img/icons/dir-tencent.png'
import dirWeiXin from '../../img/icons/dir-weixin.png'
import dirMi from '../../img/icons/dir-mi.png'
import dirQQBrowser from '../../img/icons/dir-qq-browser.png'
import { get } from 'lodash'
import { line } from '../../utils'
import { getThumbnailUrl } from '../../utils/api'
import { CALLABLE_APP_LIST } from '../../utils/appList'


const VIDEO_MATCH_LIST = ['mp4', 'mkv', 'avi', 'rm', 'rmvb']

const THUMBNAIL_MATCH_LIST = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'pbm', 'bmp',
  ...VIDEO_MATCH_LIST,
]

const DEFAULT_ENTRY_ICON: IEntryIcon = {
  type: 'unknown',
  icon: <Help20 />,
  iconClassName: 'text-gray-500 bg-gray-200 border-gray-200',
  matchList: [],
}

const ENTRY_ICON_LIST: IEntryIcon[] = [
  {
    type: 'folder',
    icon: <Folder32 />,
    iconClassName: 'text-white bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-400',
    matchList: ['_dir'],
  },
  {
    type: 'folder',
    icon: <Folder32 />,
    iconClassName: 'text-white bg-gradient-to-b from-yellow-200 to-yellow-400 border-yellow-300',
    matchList: ['_dir_new'],
  },
  {
    type: 'folder',
    icon: <Folder32 />,
    iconClassName: 'text-white bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-400',
    matchList: ['_dir_empty'],
  },
  {
    type: 'document',
    icon: <Pen20 />,
    iconClassName: 'text-gray-500 bg-gray-100 border-gray-300',
    matchList: ['_txt_new', 'txt', 'md'],
  },
  {
    type: 'pdf',
    icon: <Document20 />,
    iconClassName: 'text-red-900 bg-red-100 border-red-200',
    matchList: ['pdf'],
  },
  {
    type: 'code',
    icon: <Code20 />,
    iconClassName: 'text-green-400 bg-black-900 border-green-600',
    matchList: ['html', 'css', 'js', 'php'],
  },
  {
    type: 'data',
    icon: <DataBase20 />,
    iconClassName: 'text-gray-700 bg-gray-100 border-gray-300',
    matchList: ['dat', 'db', 'sql', 'json', 'log'],
  },
  {
    type: 'image',
    icon: <Image20 />,
    iconClassName: 'text-orange-500 bg-orange-100 border-orange-200',
    matchList: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'insp', 'svg', 'ico'],
  },
  {
    type: 'audio',
    icon: <Music20 />,
    iconClassName: 'text-pink-700 bg-pink-100 border-pink-200',
    matchList: ['mp3', 'flac', 'wav', 'aac'],
  },
  {
    type: 'video',
    icon: <Video20 />,
    iconClassName: 'text-blue-500 bg-blue-100 border-blue-200',
    matchList: ['mp4', 'mov', 'wmv', 'insv', 'mkv', 'avi', 'rm', 'rmvb'],
  },
  {
    type: 'archive',
    icon: <Box20 />,
    iconClassName: 'text-amber-700 bg-amber-100 border-amber-300',
    matchList: ['zip', 'rar', '.7z'],
  },
  {
    type: 'application',
    icon: <Application20 />,
    iconClassName: 'text-lime-600 bg-lime-100 border-lime-300',
    matchList: ['apk'],
  }
]

const DIR_SUB_ICON_MAP = {
  'alipay': dirAlipay,
  'Android': dirAndroid,
  'autonavi': dirAutonavi,
  'backups': dirBackup,
  'baidu': dirBaidu,
  'browser': dirBrowser,
  'DCIM': dirCamera,
  'DuoKan': dirDuokan,
  'Download': dirDownload,
  'Fonts': dirFonts,
  'Movies': dirMovies,
  'Music': dirMusic,
  'Pictures': dirPictures,
  'QQBrowser': dirQQBrowser,
  'RetroArch': dirRetroArch,
  'sogou': dirSogou,
  'Tencent': dirTencent,
  'MIUI': dirMi,
  'miad': dirMi,
  'WeiXin': dirWeiXin,
}

const getIconInfo = (entry: IEntry) => {
  const { name, type, extension } = entry
  const isDir = type === 'directory'
  const entryIcon = extension
    ? (ENTRY_ICON_LIST.find(o => o.matchList.includes(extension)) || DEFAULT_ENTRY_ICON)
    : DEFAULT_ENTRY_ICON

  const dirSubIcon = isDir
    ? get(DIR_SUB_ICON_MAP, name)
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
    const useThumbnail = extension && THUMBNAIL_MATCH_LIST.includes(extension)
    const isVideo = extension && VIDEO_MATCH_LIST.includes(extension)
    const { isDir, entryIcon: { icon, iconClassName }, dirSubIcon, fileSubIcon } = getIconInfo(entry)
    return {
      useThumbnail, isVideo, isDir,
      icon, iconClassName, dirSubIcon, fileSubIcon,
    }
  }, [entry])

  const showThumbnail = !virtual && useThumbnail && !thumbnailError

  const DirSubIcon = dirSubIcon && (
    <div
      className={line(`
        absolute left-0 bottom-0 bg-center bg-no-repeat bg-contain m-1px
        ${small ? 'w-3 h-3' : 'w-5 h-5'}
      `)}
      style={{ backgroundImage: `url("${dirSubIcon}")` }}
    />
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
            src={getThumbnailUrl(`${parentPath}/${name}`)}
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
            ${(!isDir && !small) ? 'w-10 h-12 rounded    rounded-tr-lg' : ''}
            ${iconClassName}
          `)}
        >
          {small ? icon : (
            <div>
              <div>{icon}</div>
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
