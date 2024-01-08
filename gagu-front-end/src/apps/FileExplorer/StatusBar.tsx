import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { SvgIcon } from '../../components/common'
import { copy, getEntryPath, line } from '../../utils'
import { IEntry, IRootEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { useDragDrop, useTouchMode } from '../../hooks'

interface StatusBarProps {
  loading: boolean
  folderCount: number
  fileCount: number
  currentPath: string
  currentRootEntry: IRootEntry | null
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
    currentRootEntry,
    selectedEntryList,
    onDirClick,
    onRootEntryClick,
  } = props

  const { t } = useTranslation()

  const touchMode = useTouchMode()
  const dragDropProps = useDragDrop({ onOpen: onDirClick })

  const {
    selectedCount,
    selectedSingle,
    rootEntryPath,
    centerPathList,
    isRootEntryDisabled,
  } = useMemo(() => {
    const selectedCount = selectedEntryList.length
    const selectedSingle = selectedCount === 1
    const rootEntryPath = getEntryPath(currentRootEntry)
    const centerPathList = currentPath.replace(rootEntryPath, '').split('/').filter(Boolean)

    if (selectedCount === 1) {
      centerPathList.push(selectedEntryList[0].name)
    }

    const isRootEntryDisabled = currentPath === rootEntryPath || !centerPathList.length

    return {
      selectedCount,
      selectedSingle,
      rootEntryPath,
      centerPathList,
      isRootEntryDisabled,
    }
  }, [currentPath, currentRootEntry, selectedEntryList])

  if (!currentRootEntry) return <div />

  return (
    <div
      className={line(`
        px-2
        flex-shrink-0 flex justify-between items-center
        text-xs text-gray-500 select-none bg-gray-100
        dark:text-zinc-400 dark:bg-zinc-700
        ${touchMode ? 'h-6' : 'py-1'}
      `)}
    >
      <div className="relative z-0 h-full overflow-x-auto group flex items-center">
        <div className={`mr-4 ${touchMode ? 'whitespace-nowrap' : ''}`}>
          <span
            title={rootEntryPath}
            {...dragDropProps}
            data-is-drag-drop-node={isRootEntryDisabled ? 'false' : 'true'}
            data-entry-path={rootEntryPath}
            className={line(`
              gagu-file-explorer-status-bar-folder relative
              ${isRootEntryDisabled ? '' : 'cursor-pointer hover:text-black dark:hover:text-zinc-200'}
            `)}
            onClick={() => {
              if (!isRootEntryDisabled && currentRootEntry) {
                onRootEntryClick(currentRootEntry)
              }
            }}
          >
            <span className="pointer-events-none">
              {currentRootEntry.isDisk
                ? <SvgIcon.HardDrive className="-mt-[2px] mr-1 inline-block" size={12} />
                : <SvgIcon.Folder className="-mt-[2px] mr-1 inline-block" size={12} />
              }
              {currentRootEntry.name}
            </span>
          </span>
          {centerPathList.map((path, pathIndex) => {
            const prefix = centerPathList.filter((p, pIndex) => pIndex < pathIndex).join('/')
            const fullPath = `${rootEntryPath}/${prefix ? `${prefix}/` : ''}${path}`
            const isLast = pathIndex === centerPathList.length - 1
            const showFileIcon = selectedSingle && isLast && !selectedEntryList[0].extension.startsWith('_dir')
            const disabled = pathIndex > centerPathList.length - 2 - (selectedSingle ? 1 : 0)

            return (
              <span key={encodeURIComponent(fullPath)}>
                <SvgIcon.ChevronRight size={14} className="inline -mt-[2px] text-gray-300 dark:text-zinc-500" />
                <span
                  title={fullPath}
                  {...dragDropProps}
                  data-is-drag-drop-node={isLast ? 'false' : 'true'}
                  data-entry-path={fullPath}
                  className={line(`
                    gagu-file-explorer-status-bar-folder relative
                    ${disabled ? '' : 'cursor-pointer hover:text-black dark:hover:text-zinc-200'}
                  `)}
                  onClick={() => !disabled && onDirClick(fullPath)}
                >
                  <span className="pointer-events-none">
                    {showFileIcon
                      ? <SvgIcon.File className="-mt-[2px] mr-1 inline-block" size={12} />
                      : <SvgIcon.Folder className="-mt-[2px] mr-1 inline-block" size={12} />
                    }
                    {path}
                  </span>
                </span>
              </span>
            )
          })}
          <span
            title={t`action.copy`}
            className={line(`
              md:invisible ml-2 cursor-pointer group-hover:visible text-xs
            hover:text-gray-500 active:opacity-70
              dark:hover:text-zinc-200
            `)}
            onClick={() => {
              copy(`${rootEntryPath}${centerPathList.length ? `/${centerPathList.join('/')}` : ''}`)
              toast.success(t`tip.copied`)
            }}
          >
            <SvgIcon.Copy size={12} className="inline -mt-[2px]" />
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center pl-4 pr-1 font-din text-gray-400">
        {!!selectedCount && (
          <>
            <SvgIcon.Check size={14} />&nbsp;<span>{loading ? '-' : selectedCount}</span>
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
