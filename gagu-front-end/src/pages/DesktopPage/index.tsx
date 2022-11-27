import ContextMenu from './ContextMenu'
import WindowContainer from './WindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'
import MenuBar from './MenuBar'
import EntrySelector from './EntrySelector'

// fixed z-0 DesktopPage
// -               EntrySelector
// - absolute z-30 ContextMenu
// - absolute z-20 MenuBar & /TransferAssistant
// - absolute z-20 Dock
// - absolute z-10 WindowContainer
// - absolute z-0  Desktop

export default function DesktopPage() {
  return (
    <div
      className="gg-desktop-page fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-gray-600 to-gray-400"
      onContextMenuCapture={e => e.preventDefault()}
    >
      <EntrySelector />
      <ContextMenu />
      <MenuBar />
      <Dock />
      <WindowContainer />
      <Desktop />
    </div>
  )
}
