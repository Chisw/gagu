import { useRecoilState } from 'recoil'
import FileExplorer from '../apps/FileExplorer'
import ContextMenu from './DesktopPage/ContextMenu'
import MenuBar from './DesktopPage/MenuBar'
import { activePageState } from '../states'
import { useEffect } from 'react'
import { Page } from '../types'

export default function ExplorePage() {

  const [, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.explore))
  }, [setActivePage])

  return (
    <>
      <div
        data-customized-scrollbar
        className="fixed z-0 inset-0 bg-gray-200"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <MenuBar />
        <div className="absolute z-0 inset-0 mt-6 border-t">
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
