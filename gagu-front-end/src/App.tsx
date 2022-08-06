import './css/index.css'
import TopBar from './components/layouts/TopBar'
import Desktop from './components/layouts/Desktop'
import WindowContainer from './components/layouts/WindowContainer'
import Dock from './components/layouts/Dock'
import { FocusStyleManager } from '@blueprintjs/core'

FocusStyleManager.onlyShowFocusOnTabs()

function App() {
  return (
    <div onContextMenuCapture={e => e.preventDefault()}>
      <TopBar />
      <Desktop>
        <WindowContainer />
        <Dock />
      </Desktop>
    </div>
  )
}

export default App
