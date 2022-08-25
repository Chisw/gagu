import ContextMenu from './ContextMenu'
import AppWindowContainer from './AppWindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'

// fixed z-0 DesktopPage
// - absolute z-30 ContextMenu
// - absolute z-20 Dock
// - absolute z-10 AppWindowContainer
// - absolute z-0  Desktop

export default function DesktopPage() {
  return (
    <div
      className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-900"
      onContextMenuCapture={e => e.preventDefault()}
    >
      <ContextMenu />
      <Dock />
      <AppWindowContainer />
      <Desktop />
    </div>
  )
}
