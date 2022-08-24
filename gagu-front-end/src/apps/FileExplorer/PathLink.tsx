import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { SvgIcon } from '../../components/base'
import { copy } from '../../utils'
import { IEntry } from '../../utils/types'

interface PathLinkProps {
  loading: boolean
  folderCount: number
  fileCount: number
  currentDirPath: string
  activeRootEntryMounted: string
  selectedEntryList: IEntry[]
  onDirClick: (mounted: string) => void
  onRootEntryClick: (mounted: string) => void
}

export default function PathLink(props: PathLinkProps) {

  const {
    loading,
    folderCount,
    fileCount,
    currentDirPath,
    activeRootEntryMounted,
    selectedEntryList,
    onDirClick,
    onRootEntryClick,
  } = props

  const {
    selectedLen,
    mountList,
    isRootEntryDisabled,
  } = useMemo(() => {
    const selectedLen = selectedEntryList.length
    const mountList = currentDirPath.replace(activeRootEntryMounted, '').split('/').filter(Boolean)
    if (selectedLen === 1) {
      mountList.push(selectedEntryList[0].name)
    }
    const isRootEntryDisabled = currentDirPath === activeRootEntryMounted || !mountList.length
    return {
      selectedLen,
      mountList,
      isRootEntryDisabled,
    }
  }, [currentDirPath, activeRootEntryMounted, selectedEntryList])

  if (!activeRootEntryMounted) return <div />

  return (
    <div className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 select-none flex justify-between items-center bg-gray-100 border-t">
      <div className="group">
        <span
          title={activeRootEntryMounted}
          className={isRootEntryDisabled ? '' : 'cursor-pointer hover:text-black'}
          onClick={() => !isRootEntryDisabled && onRootEntryClick(activeRootEntryMounted)}
        >
          {activeRootEntryMounted}
        </span>
        {mountList.map((mounted, mountIndex) => {
          const prefix = mountList.filter((m, mIndex) => mIndex < mountIndex).join('/')
          const fullPath = `${activeRootEntryMounted}/${prefix ? `${prefix}/` : ''}${mounted}`
          const disabled = mountIndex > mountList.length - 2 - (selectedLen === 1 ? 1 : 0)
          return (
            <span key={encodeURIComponent(fullPath)}>
              <SvgIcon.ChevronRight size={14} className="inline -mt-2px" />
              <span
                title={fullPath}
                className={disabled ? '' : 'cursor-pointer hover:text-black'}
                onClick={() => !disabled && onDirClick(fullPath)}
              >
                {mounted}
              </span>
            </span>
          )
        })}
        <span
          title="复制"
          className="invisible ml-1 cursor-pointer group-hover:visible text-xs hover:text-gray-500 active:opacity-50"
          onClick={() => {
            copy(`${activeRootEntryMounted}/${mountList.join('/')}`)
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
