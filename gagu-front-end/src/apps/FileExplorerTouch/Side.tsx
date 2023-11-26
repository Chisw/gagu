import RootEntryList from '../../apps/FileExplorer/RootEntryList'
import { SvgIcon } from '../../components/common'
import { IEntry, IRootEntry } from '../../types'
import { line } from '../../utils'

interface SideProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  currentPath: string
  rootEntryList: IRootEntry[]
  favoriteEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteClick: (entry: IEntry, isFavorited: boolean) => void
  asSelector?: boolean
}

export default function Side(props: SideProps) {

  const {
    sideShow,
    setSideShow,
    currentPath,
    rootEntryList,
    favoriteEntryList,
    onRootEntryClick,
    onFavoriteClick,
    asSelector = false,
  } = props

  return (
    <>
      <div
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 bottom-0 left-0 pb-12 w-64 bg-gray-100 overflow-x-hidden overflow-y-auto border-r
          duration-transform duration-500 ease-in-out
          ${sideShow ? 'translate-x-0' : '-translate-x-64'}
          ${asSelector ? 'top-0' : 'top-8 md:top-6'}
        `)}
      >
        <RootEntryList
          {...{ currentPath, rootEntryList }}
          onRootEntryClick={onRootEntryClick}
        />
        <RootEntryList
          {...{ currentPath, rootEntryList: favoriteEntryList }}
          onRootEntryClick={onRootEntryClick}
          onFavoriteCancel={(entry) => onFavoriteClick(entry, true)}
        />
        <div
          className="absolute right-0 bottom-0 left-0 px-4 h-12 flex items-center"
          onClick={() => setSideShow(false)}
        >
          <SvgIcon.ArrowLeft />
        </div>
      </div>
      <div
        className={`absolute z-10 top-8 md:top-6 right-0 bottom-0 left-64 ${sideShow ? '' : 'hidden'}`}
        onClick={() => setSideShow(false)}
      />
    </>
  )
}
