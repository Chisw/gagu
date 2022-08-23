import AppWindowContainer from './AppWindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'

export default function DesktopPage() {
  return (
    <div
      className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-900"
      onContextMenuCapture={e => e.preventDefault()}
    >
      <AppWindowContainer />
      <Desktop />
      <Dock />
    </div>
  )
}
