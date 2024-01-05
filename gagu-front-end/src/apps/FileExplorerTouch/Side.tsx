import RootEntryGroups, { RootEntryGroupsProps } from '../FileExplorer/RootEntryGroups'
import { line } from '../../utils'

interface SideProps extends RootEntryGroupsProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  asEntryPicker?: boolean
}

export default function Side(props: SideProps) {

  const {
    sideShow,
    setSideShow,
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
          bg-gray-100 overflow-x-hidden overflow-y-auto border-r
          duration-transform duration-300 ease-in-out
          dark:bg-black dark:border-zinc-600
          ${sideShow ? 'translate-x-0' : '-translate-x-64'}
          ${asEntryPicker ? 'top-0' : 'top-8 md:top-6'}
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
        className={`absolute z-10 top-8 md:top-6 right-0 bottom-0 left-64 ${sideShow ? '' : 'hidden'}`}
        onClick={() => setSideShow(false)}
      />
    </>
  )
}
