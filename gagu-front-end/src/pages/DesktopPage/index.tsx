import ContextMenu from './ContextMenu'
import WindowContainer from './WindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'
import MenuBar from './MenuBar'
import EntrySelector from './EntrySelector'
import { FsApi } from '../../api'

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
      className="gagu-desktop-page fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-600"
      onContextMenuCapture={e => e.preventDefault()}
    >
      <div
        className="gagu-background-desktop absolute z-0 inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${FsApi.getBackgroundStreamUrl('desktop')}")` }}
      />
      <EntrySelector />
      <ContextMenu />
      <MenuBar />
      <Dock />
      <WindowContainer />
      <Desktop />
    </div>
  )
}
