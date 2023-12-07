import SideEntryList from '../FileExplorer/SideEntryList'
import { ISideEntry } from '../../types'
import { line } from '../../utils'

interface SideProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  currentPath: string
  sideEntryList: ISideEntry[]
  onSideEntryClick: (sideEntry: ISideEntry) => void
  onFavoriteCancel: (sideEntry: ISideEntry) => void
  asSelector?: boolean
}

export default function Side(props: SideProps) {

  const {
    sideShow,
    setSideShow,
    currentPath,
    sideEntryList,
    onSideEntryClick,
    onFavoriteCancel,
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
        <SideEntryList
          {...{ currentPath, sideEntryList }}
          onSideEntryClick={onSideEntryClick}
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
