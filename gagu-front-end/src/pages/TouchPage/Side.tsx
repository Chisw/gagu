import RootEntryList from '../../apps/FileExplorer/RootEntryList'
import { SvgIcon } from '../../components/common'
import { IEntry, IRootEntry } from '../../types'
import { line, vibrate } from '../../utils'

interface SideProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  currentPath: string
  rootEntryList: IRootEntry[]
  favoriteEntryList: IRootEntry[]
  handleRootEntryClick: (rootEntry: IRootEntry) => void
  handleFavoriteClick: (entry: IEntry, isFavorited: boolean) => void
}

export default function Side(props: SideProps) {

  const {
    sideShow,
    setSideShow,
    currentPath,
    rootEntryList,
    favoriteEntryList,
    handleRootEntryClick,
    handleFavoriteClick,
  } = props

  return (
    <>
      <div
        className={line(`
          absolute z-0 top-6 bottom-0 left-0 pb-12 w-56 bg-gray-100 overflow-x-hidden overflow-y-auto border-r
          duration-transform duration-500 ease-in-out
          ${sideShow ? 'translate-x-0' : '-translate-x-56'}
        `)}
      >
        <RootEntryList
          {...{ currentPath, rootEntryList }}
          onRootEntryClick={handleRootEntryClick}
        />
        <RootEntryList
          {...{ currentPath, rootEntryList: favoriteEntryList }}
          onRootEntryClick={handleRootEntryClick}
          onFavoriteCancel={(entry) => handleFavoriteClick(entry, true)}
        />
        <div
          className="absolute right-0 bottom-0 left-0 px-4 h-12 flex items-center"
          onClick={() => {
            vibrate()
            setSideShow(false)
          }}
        >
          <SvgIcon.ArrowLeft />  
        </div>
      </div>
    </>
  )
}
