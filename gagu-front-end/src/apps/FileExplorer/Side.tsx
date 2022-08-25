import { line } from '../../utils'
import { IRootEntry } from '../../utils/types'
import RootEntryList from './RootEntryList'

interface SideProps {
  sideCollapse: boolean
  currentPath: string
  activeRootEntryMounted: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (mounted: string) => void
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    activeRootEntryMounted,
    rootEntryList,
    onRootEntryClick,
  } = props
  
  return (
    <div
      className={line(`
        relative flex-shrink-0 h-full transition-all duration-300 select-none overflow-hidden
        ${sideCollapse ? 'w-0' : 'w-52'}
      `)}
    >
      <div className="p-2 w-52 h-full border-r overflow-x-hidden overflow-y-auto">
        {/* <p className="p-1 text-xs text-gray-400">收藏</p> */}
        <RootEntryList
          {...{ currentPath, activeRootEntryMounted, rootEntryList }}
          onRootEntryClick={onRootEntryClick}
        />
      </div>
    </div>
  )
}
