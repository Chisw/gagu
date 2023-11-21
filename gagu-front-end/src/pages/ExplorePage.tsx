import { useRecoilState } from 'recoil'
import FileExplorer from '../apps/FileExplorer'
import ContextMenu from './DesktopPage/ContextMenu'
import MenuBar from './DesktopPage/MenuBar'
import { activePageState } from '../states'
import { useEffect } from 'react'
import { Page } from '../types'
import { line } from '../utils'

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
        <MenuBar />
        <div
          className={line(`
            absolute z-0 inset-0 mt-6 border-t
            transition-all duration-500
            ${activePage === Page.explore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10%]'}
          `)}
        >
          <FileExplorer
            isTopWindow={true}
            setWindowLoading={() => {}}
            setWindowTitle={() => {}}
            closeWindow={() => {}}
            windowSize={{ width: 1080, height: 1920 }}
          />
        </div>
        <ContextMenu />
      </div>
    </>
  )
}
