import RootEntryGroups, { RootEntryGroupsProps } from '../FileExplorer/RootEntryGroups'
import { line } from '../../utils'

interface SideProps extends RootEntryGroupsProps {
  sideVisible: boolean
  setSideVisible: (visible: boolean) => void
  asEntryPicker?: boolean
}

export default function Side(props: SideProps) {

  const {
    sideVisible,
    setSideVisible,
    currentPath,
    rootEntryList,
    onRootEntryClick,
    onFavoriteCancel,
    asEntryPicker = false,
  } = props

  return (
    <>
      <div
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 bottom-0 left-0 pb-4 w-64
          bg-zinc-100
          overflow-x-hidden overflow-y-auto border-r border-gray-200
          duration-transform duration-300 ease-in-out
          dark:bg-zinc-900 dark:border-zinc-600
          ${sideVisible ? 'translate-x-0' : '-translate-x-64'}
          ${asEntryPicker ? 'top-0' : 'top-8'}
        `)}
      >
        <RootEntryGroups
          currentPath={currentPath}
          rootEntryList={rootEntryList}
          onRootEntryClick={onRootEntryClick}
          onFavoriteCancel={onFavoriteCancel}
        />
      </div>
      <div
        className={`absolute z-10 top-8 right-0 bottom-0 left-64 ${sideVisible ? '' : 'hidden'}`}
        onClick={() => setSideVisible(false)}
      />
    </>
  )
}
