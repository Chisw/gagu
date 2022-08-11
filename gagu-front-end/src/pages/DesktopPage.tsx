import Desktop from '../components/layouts/Desktop'
import WindowContainer from '../components/layouts/WindowContainer'
import Dock from '../components/layouts/Dock'

export default function DesktopPage() {
  return (
    <div onContextMenuCapture={e => e.preventDefault()}>
      <Desktop>
        <WindowContainer />
        <Dock />
      </Desktop>
    </div>
  )
}
