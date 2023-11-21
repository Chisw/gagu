import { useRecoilState } from 'recoil'
import FileExplorer from '../../apps/FileExplorer'
import { activePageState } from '../../states'
import { useEffect } from 'react'
import { Page } from '../../types'
import { line } from '../../utils'
import EntrySelector from '../../components/EntrySelector'
import ContextMenu from '../../components/ContextMenu'
import MenuBar from '../../components/MenuBar'

export default function ExplorePage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.explore))
  }, [setActivePage])

  return (
    <>
      <div
        data-customized-scrollbar
        className="fixed z-0 inset-0 bg-gray-200 overflow-hidden"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <EntrySelector />
        <ContextMenu />
        <MenuBar />
        <div
          className={line(`
            absolute z-0 inset-0 mt-6 border-t
            transition-all duration-500
            ${activePage === Page.explore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10%]'}
          `)}
        >
          <FileExplorer
            isTopWindow
            setWindowLoading={() => {}}
            setWindowTitle={() => {}}
            closeWindow={() => {}}
            windowSize={{ width: 1080, height: 1920 }}
          />
        </div>
      </div>
    </>
  )
}
