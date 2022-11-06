import FileExplorer from '../apps/FileExplorer'
import ContextMenu from './DesktopPage/ContextMenu'
import MenuBar from './DesktopPage/MenuBar'

export default function ExplorePage() {
  return (
    <>
      <div
        className="fixed z-0 inset-0 bg-gray-200"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <MenuBar />
        <div className="absolute z-0 inset-0 mt-6 border-t">
          <FileExplorer
            isTopWindow={true}
            setWindowLoading={() => {}}
            setWindowTitle={() => {}}
            windowSize={{ width: 1080, height: 1920 }}
          />
        </div>
        <ContextMenu />
      </div>
    </>
  )
}
