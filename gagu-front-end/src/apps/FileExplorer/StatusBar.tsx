import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { SvgIcon } from '../../components/common'
import { copy, getEntryPath, line } from '../../utils'
import { IEntry, IRootEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { useTouchMode } from '../../hooks'

interface StatusBarProps {
  loading: boolean
  folderCount: number
  fileCount: number
  currentPath: string
  rootEntry: IRootEntry | null
  selectedEntryList: IEntry[]
  onDirClick: (dir: string) => void
  onRootEntryClick: (rootEntry: IRootEntry) => void
}

export default function StatusBar(props: StatusBarProps) {

  const {
    loading,
    folderCount,
    fileCount,
    currentPath,
    rootEntry,
    selectedEntryList,
    onDirClick,
    onRootEntryClick,
  } = props

  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const {
    selectedLen,
    rootEntryPath,
    centerPathList,
    isRootEntryDisabled,
  } = useMemo(() => {
    const selectedLen = selectedEntryList.length
    const rootEntryPath = getEntryPath(rootEntry)
    const centerPathList = currentPath.replace(rootEntryPath, '').split('/').filter(Boolean)
    if (selectedLen === 1) {
      centerPathList.push(selectedEntryList[0].name)
    }
    const isRootEntryDisabled = currentPath === rootEntryPath || !centerPathList.length
    return {
      selectedLen,
      rootEntryPath,
      centerPathList,
      isRootEntryDisabled,
    }
  }, [currentPath, rootEntry, selectedEntryList])

  if (!rootEntry) return <div />

  return (
    <div
      className={line(`
        px-2
        flex-shrink-0 flex justify-between items-center
        text-xs text-gray-500 select-none bg-gray-100
        ${touchMode ? 'h-6' : 'py-1'}
      `)}
    >
      <div className="relative z-0 h-full overflow-x-auto group flex items-center">
        <div className={`mr-4 ${touchMode ? 'whitespace-nowrap' : ''}`}>
          <span
            title={rootEntryPath}
            className={isRootEntryDisabled ? '' : 'cursor-pointer hover:text-black'}
            onClick={() => !isRootEntryDisabled && rootEntry && onRootEntryClick(rootEntry)}
          >
            {rootEntry.isDisk
              ? <SvgIcon.HardDrive className="-mt-[2px] mr-1 inline-block" size={12} />
              : <SvgIcon.Folder className="-mt-[2px] mr-1 inline-block" size={12} />
            }
            {rootEntry.name}
          </span>
          {centerPathList.map((path, pathIndex) => {
            const prefix = centerPathList.filter((p, pIndex) => pIndex < pathIndex).join('/')
            const fullPath = `${rootEntryPath}/${prefix ? `${prefix}/` : ''}${path}`
            const oneSelected = selectedLen === 1
            const isLast = pathIndex === centerPathList.length - 1
            const showFileIcon = oneSelected && isLast && !selectedEntryList[0].extension.startsWith('_dir')
            const disabled = pathIndex > centerPathList.length - 2 - (oneSelected ? 1 : 0)

            return (
              <span key={encodeURIComponent(fullPath)}>
                <SvgIcon.ChevronRight size={14} className="inline -mt-[2px] text-gray-300" />
                <span
                  title={fullPath}
                  className={disabled ? '' : 'cursor-pointer hover:text-black'}
                  onClick={() => !disabled && onDirClick(fullPath)}
                >
                  {showFileIcon
                    ? <SvgIcon.File className="-mt-[2px] mr-1 inline-block" size={12} />
                    : <SvgIcon.Folder className="-mt-[2px] mr-1 inline-block" size={12} />
                  }
                  {path}
                </span>
              </span>
            )
          })}
          <span
            title={t`action.copy`}
            className="md:invisible ml-2 cursor-pointer group-hover:visible text-xs hover:text-gray-500 active:opacity-70"
            onClick={() => {
              const value = `${rootEntryPath}/${centerPathList.join('/')}`
              copy(value)
              toast.success(t('tip.copied', { value }))
            }}
          >
            <SvgIcon.Copy size={12} className="inline -mt-[2px]" />
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center pl-4 pr-1 font-din text-gray-400">
        {!!selectedLen && (
          <>
            <SvgIcon.Check size={14} />&nbsp;<span>{loading ? '-' : selectedLen}</span>
            &emsp;
          </>
        )}
        <SvgIcon.Folder size={14} />&nbsp;<span>{loading ? '-' : folderCount}</span>
        &emsp;
        <SvgIcon.File size={14} />&nbsp;<span>{loading ? '-' : fileCount}</span>
      </div>
    </div>
  )
}
