import { ContextMenu, MenuBar } from '../../components'
import { useRecoilState } from 'recoil'
import FileExplorer from '../../apps/FileExplorer'
import { activePageState, runningAppListState } from '../../states'
import { useEffect, useState } from 'react'
import { AppId, Page } from '../../types'
import { line } from '../../utils'
import Dock from './Dock'
import Window from './Window'

export default function ExplorePage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [runningAppList] = useRecoilState(runningAppListState)

  const [show, setShow] = useState(false)
  const [activeAppId, setActiveAppId] = useState<string>(AppId.fileExplorer)
  
  useEffect(() => {
    setTimeout(() => setActivePage(Page.explore))
  }, [setActivePage])

  useEffect(() => {
    if (activePage === Page.explore) {
      setTimeout(() => setShow(true), 300)
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
        <ContextMenu /> {/* z-30 */}
        <MenuBar />     {/* z-20 */}

        {/* z-10 */}
        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
            isTopWindow={app.id === activeAppId}
            onClose={() => setActiveAppId(AppId.fileExplorer)}
          />
        ))}

        {/* z-0 */}
        <div
          className={line(`
            absolute z-0 inset-0 top-8 md:top-6 bottom-10
            transition-all duration-500 bg-gray-200
            dark:bg-black dark:bg-opacity-60
            ${show ? 'opacity-100' : 'opacity-0'}
          `)}
        >
          <FileExplorer
            isTopWindow={AppId.fileExplorer === activeAppId}
            windowSize={{ width: 1080, height: 1920 }}
            setWindowTitle={() => {}}
            closeWindow={() => {}}
          />
        </div>

        {/* z-0 */}
        <Dock {...{ activeAppId, setActiveAppId }} />
      </div>
    </>
  )
}
