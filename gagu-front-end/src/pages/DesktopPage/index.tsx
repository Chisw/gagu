import { ContextMenu, MenuBar } from '../../components'
import WindowContainer from './WindowContainer'
import Desktop from './Desktop'
import Dock from './Dock'
import { FsApi } from '../../api'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { activePageState } from '../../states'
import { line } from '../../utils'
import { Page } from '../../types'

export default function DesktopPage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.desktop))
  }, [setActivePage])

  return (
    <div
      data-customized-scrollbar
      className="gagu-desktop-page fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-black to-zinc-600"
      onContextMenuCapture={e => e.preventDefault()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        if ((e.target as any).tagName === 'INPUT') return
        e.preventDefault()
      }}
    >
      <div
        className={line(`
          gagu-public-image-bg-desktop absolute z-0 inset-0 bg-cover bg-center
          transition-all duration-1000 ease-out
          ${activePage === Page.desktop ? 'scale-100 opacity-100' : 'scale-110 opacity-50'}
        `)}
        style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-desktop')}")` }}
      />
      <ContextMenu />     {/* z-30 */}
      <MenuBar />         {/* z-20 */}
      <Dock />            {/* z-20 */}
      <WindowContainer /> {/* z-10 */}
      <Desktop />         {/* z-0 */}
    </div>
  )
}
