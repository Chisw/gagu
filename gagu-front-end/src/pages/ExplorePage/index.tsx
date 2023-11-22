import { useRecoilState } from 'recoil'
import FileExplorer from '../../apps/FileExplorer'
import { activePageState, runningAppListState } from '../../states'
import { useEffect, useState } from 'react'
import { Page } from '../../types'
import { line } from '../../utils'
import { APP_ID_MAP } from '../../apps'
import EntrySelector from '../../components/EntrySelector'
import ContextMenu from '../../components/ContextMenu'
import MenuBar from '../../components/MenuBar'
import Dock from './Dock'
import Window from './Window'

export default function ExplorePage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [runningAppList] = useRecoilState(runningAppListState)

  const [show, setShow] = useState(false)
  const [activeAppId, setActiveAppId] = useState(APP_ID_MAP.fileExplorer)
  
  useEffect(() => {
    setTimeout(() => setActivePage(Page.explore))
  }, [setActivePage])

  useEffect(() => {
    if (activePage === Page.explore) {
      setTimeout(() => setShow(true), 400)
    } else {
      setShow(false)
    }
  }, [activePage])

  return (
    <>
      <div
        data-customized-scrollbar
        className="fixed z-0 inset-0 overflow-hidden"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <EntrySelector />
        <ContextMenu />     {/* z-30 */}
        <MenuBar />         {/* z-20 */}

        {/* z-10 */}
        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
            isTopWindow={app.id === activeAppId}
            onClose={() => setActiveAppId(APP_ID_MAP.fileExplorer)}
          />
        ))}

        {/* z-0 */}
        <div
          className={line(`
            absolute z-0 inset-0 top-6 bottom-10
            transition-all duration-500 bg-gray-200
            ${show ? 'opacity-100' : 'opacity-0'}
          `)}
        >
          <FileExplorer
            isTopWindow={APP_ID_MAP.fileExplorer === activeAppId}
            windowSize={{ width: 1080, height: 1920 }}
            setWindowLoading={() => {}}
            setWindowTitle={() => {}}
            onClose={() => {}}
          />
        </div>

        <Dock {...{ activeAppId, setActiveAppId }} /> {/* z-0 */}
      </div>
    </>
  )
}
