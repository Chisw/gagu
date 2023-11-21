import ContextMenu from '../../components/ContextMenu'
import WindowContainer from './WindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'
import MenuBar from '../../components/MenuBar'
import EntrySelector from '../../components/EntrySelector'
import { FsApi } from '../../api'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { activePageState } from '../../states'
import { line } from '../../utils'
import { Page } from '../../types'

// fixed z-0 DesktopPage
// -               EntrySelector
// - absolute z-30 ContextMenu
// - absolute z-20 MenuBar & /TransferPannel
// - absolute z-20 Dock
// - absolute z-10 WindowContainer
// - absolute z-0  Desktop

export default function DesktopPage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.desktop))
  }, [setActivePage])

  return (
    <div
      data-customized-scrollbar
      className="gagu-desktop-page fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-black to-slate-600"
      onContextMenuCapture={e => e.preventDefault()}
    >
      <div
        className={line(`
          gagu-public-image-bg-desktop absolute z-0 inset-0 bg-cover bg-center
          transition-all duration-1000 ease-out
          ${activePage === 'desktop' ? 'scale-100 opacity-100' : 'scale-110 opacity-50'}
        `)}
        style={{ backgroundImage: `url("${FsApi.getImageStreamUrl('bg-desktop')}")` }}
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
