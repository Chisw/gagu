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
        relative shrink-0
        h-full overflow-hidden select-none
        bg-zinc-100
        transition-all duration-300
        ${sideCollapse ? 'w-0' : 'w-56'}
      `)}
    >
      <div
        className={line(`
          pb-4 w-56 h-full
          overflow-x-hidden overflow-y-auto
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
