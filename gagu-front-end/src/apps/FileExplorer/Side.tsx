import RootEntryGroups, { RootEntryGroupsProps } from './RootEntryGroups'
import { line } from '../../utils'

interface SideProps extends RootEntryGroupsProps {
  sideCollapse: boolean
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    rootEntryList,
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
      <div
        className={line(`
          pb-4 w-56 h-full border-r border-gray-100
          overflow-x-hidden overflow-y-auto
          dark:border-zinc-700
        `)}
      >
        <RootEntryGroups
          currentPath={currentPath}
          rootEntryList={rootEntryList}
          onRootEntryClick={onRootEntryClick}
          onFavoriteCancel={onFavoriteCancel}
        />
      </div>
    </div>
  )
}
