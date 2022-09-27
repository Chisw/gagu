import { line } from '../../utils'
import { IRootEntry } from '../../types'
import RootEntryList from './RootEntryList'

interface SideProps {
  sideCollapse: boolean
  currentPath: string
  activeRootEntry: IRootEntry | null
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    activeRootEntry,
    rootEntryList,
    onRootEntryClick,
  } = props
  
  return (
    <div
      className={line(`
        relative flex-shrink-0 h-full transition-all duration-300 select-none overflow-hidden
        ${sideCollapse ? 'w-0' : 'w-56'}
      `)}
    >
      <div className="w-56 h-full border-r overflow-x-hidden overflow-y-auto">
        {/* <p className="p-1 text-xs text-gray-400">收藏</p> */}
        <RootEntryList
          {...{ currentPath, activeRootEntry, rootEntryList }}
          onRootEntryClick={onRootEntryClick}
        />
      </div>
    </div>
  )
}
