import { line } from '../../utils'
import { IEntry, IRootEntry } from '../../types'
import RootEntryList from './RootEntryList'

interface SideProps {
  sideCollapse: boolean
  currentPath: string
  rootEntryList: IRootEntry[]
  favoriteEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteCancel: (rootEntry: IEntry) => void
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    rootEntryList,
    favoriteEntryList,
    onRootEntryClick,
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
        <RootEntryList
          {...{ currentPath, rootEntryList }}
          onRootEntryClick={onRootEntryClick}
        />
        <RootEntryList
          {...{ currentPath, rootEntryList: favoriteEntryList }}
          onRootEntryClick={onRootEntryClick}
          onFavoriteCancel={onFavoriteCancel}
        />
      </div>
    </div>
  )
}
