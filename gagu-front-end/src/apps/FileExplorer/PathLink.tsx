import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { SvgIcon } from '../../components/base'
import { copy, getRootEntryPath } from '../../utils'
import { IEntry, IRootEntry } from '../../types'

interface PathLinkProps {
  loading: boolean
  folderCount: number
  fileCount: number
  currentPath: string
  rootEntry: IRootEntry | null
  selectedEntryList: IEntry[]
  onDirClick: (dir: string) => void
  onRootEntryClick: (rootEntry: IRootEntry) => void
}

export default function PathLink(props: PathLinkProps) {

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

  const {
    selectedLen,
    rootEntryPath,
    centerPathList,
    isRootEntryDisabled,
  } = useMemo(() => {
    const selectedLen = selectedEntryList.length
    const rootEntryPath = getRootEntryPath(rootEntry)
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
    <div className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 select-none flex justify-between items-center bg-gray-100 border-t">
      <div className="group">
        <span
          title={rootEntryPath}
          className={isRootEntryDisabled ? '' : 'cursor-pointer hover:text-black'}
          onClick={() => !isRootEntryDisabled && rootEntry && onRootEntryClick(rootEntry)}
        >
          {rootEntry.label || rootEntry.name}
        </span>
        {centerPathList.map((path, pathIndex) => {
          const prefix = centerPathList.filter((p, pIndex) => pIndex < pathIndex).join('/')
          const fullPath = `${rootEntryPath}/${prefix ? `${prefix}/` : ''}${path}`
          const disabled = pathIndex > centerPathList.length - 2 - (selectedLen === 1 ? 1 : 0)
          return (
            <span key={encodeURIComponent(fullPath)}>
              <SvgIcon.ChevronRight size={14} className="inline -mt-2px" />
              <span
                title={fullPath}
                className={disabled ? '' : 'cursor-pointer hover:text-black'}
                onClick={() => !disabled && onDirClick(fullPath)}
              >
                {path}
              </span>
            </span>
          )
        })}
        <span
          title="复制"
          className="invisible ml-1 cursor-pointer group-hover:visible text-xs hover:text-gray-500 active:opacity-50"
          onClick={() => {
            copy(`${rootEntryPath}/${centerPathList.join('/')}`)
            toast.success('路径复制成功')
          }}
        >
          <SvgIcon.Copy size={14} className="inline -mt-2px" />
        </span>
      </div>
      <div className="flex-shrink-0 flex items-center pl-4 pr-1 font-din">
        {!!selectedLen && (
          <>
            <SvgIcon.Check />&nbsp;<span>{loading ? '-' : selectedLen}</span>
            &emsp;
          </>
        )}
        <SvgIcon.Folder />&nbsp;<span>{loading ? '-' : folderCount}</span>
        &emsp;
        <SvgIcon.File />&nbsp;<span>{loading ? '-' : fileCount}</span>
      </div>
    </div>
  )
}
