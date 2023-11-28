import { line } from '../../utils'
import { ISideEntry } from '../../types'
import SideEntryList from './SideEntryList'

interface SideProps {
  sideCollapse: boolean
  currentPath: string
  sideEntryList: ISideEntry[]
  onSideEntryClick: (sideEntry: ISideEntry) => void
  onFavoriteCancel: (sideEntry: ISideEntry) => void
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    sideEntryList,
    onSideEntryClick,
    onFavoriteCancel,
  } = props
  
  return (
    <div
      className={line(`
        relative flex-shrink-0 h-full transition-all duration-300 select-none overflow-hidden
        ${sideCollapse ? 'w-0' : 'w-56'}
      `)}
    >
      <div className="w-56 h-full border-r border-gray-100 overflow-x-hidden overflow-y-auto">
        <SideEntryList
          {...{ currentPath, sideEntryList }}
          onSideEntryClick={onSideEntryClick}
          onFavoriteCancel={onFavoriteCancel}
        />
      </div>
    </div>
  )
}
