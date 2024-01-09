import { MenuBar } from '../../components'
import { useRecoilState } from 'recoil'
import { activePageState, runningAppListState } from '../../states'
import { useEffect, useState } from 'react'
import { AppId, Page } from '../../types'
import { vibrate } from '../../utils'
import Dock from './Dock'
import Window from './Window'
import FileExplorerTouch from '../../apps/FileExplorerTouch'

export default function TouchPage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [runningAppList] = useRecoilState(runningAppListState)

  const [show, setShow] = useState(false)
  const [isSideOrSelectionMenuShow, setIsSideOrSelectionMenuShow] = useState(false)
  const [activeAppId, setActiveAppId] = useState<string>(AppId.fileExplorer)
  const [dockExpanded, setDockExpanded] = useState(false)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.touch))
  }, [setActivePage])

  useEffect(() => {
    if (activePage === Page.touch) {
      setTimeout(() => setShow(true), 300)
    } else {
      setShow(false)
    }
  }, [activePage])

  useEffect(() => {
    const listener = (e: any) => {
      const { target } = e
      const isDisabled = target.getAttribute('data-disabled') === 'true'
      const isVibrateDisabled = target.getAttribute('data-vibrate-disabled') === 'true'
      if (isDisabled || isVibrateDisabled) return
      vibrate()
    }
    document.addEventListener('click', listener)
    return () => document.removeEventListener('click', listener)
  }, [])

  return (
    <>
      <div
        className="fixed z-0 inset-0 overflow-hidden"
        data-touch-mode="true"
        onContextMenuCapture={e => e.preventDefault()}
      >
        {/* z-30 */}
        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
            isTopWindow={app.id === activeAppId}
            onHide={() => setActiveAppId(AppId.fileExplorer)}
            onClose={() => setActiveAppId(AppId.fileExplorer)}
          />
        ))}

        {/* z-20 */}
        <MenuBar />

        {/* z-0 */}
        <FileExplorerTouch
          {...{
            show,
            activeAppId,
            setIsSideOrSelectionMenuShow,
          }}
          onPopState={() => setDockExpanded(false)}
        />
      </div>

      <Dock
        show={activeAppId === AppId.fileExplorer && !isSideOrSelectionMenuShow}
        {...{
          activeAppId,
          setActiveAppId,
          dockExpanded,
          setDockExpanded,
        }}
      />

    </>
  )
}
