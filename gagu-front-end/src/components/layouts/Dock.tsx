import { useCallback, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { openedEntryListState, runningAppListState, topWindowIndexState } from '../../utils/state'
import APP_LIST from '../../utils/appList'
import { IApp } from '../../utils/types'
import { line } from '../../utils'


export default function Dock() {

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)

  const handleOpenApp = useCallback((app: IApp) => {
    const sameRunningAppList = runningAppList.filter(a => a.id === app.id)
    const isRunning = !!sameRunningAppList.length
    if (isRunning) {
      sameRunningAppList.forEach(app => {
        const windowId = `window-${app.runningId}`
        if (document.getElementById(windowId)!.getAttribute('data-hidden') === 'true') {
          const hiddenSwitchTrigger = document.querySelector(`#${windowId} .hidden-switch-trigger`) as any
          hiddenSwitchTrigger.click()
        }
        const moveToFrontTrigger = document.querySelector(`#${windowId} .move-to-front-trigger`) as Element
        const mouseDownEvent = new MouseEvent('mousedown')
        moveToFrontTrigger.dispatchEvent(mouseDownEvent)
      })
    } else {
      setTopWindowIndex(topWindowIndex + 1)
      const list = [...runningAppList, { ...app, runningId: Date.now() }]
      setRunningAppList(list)
    }
  }, [topWindowIndex, setTopWindowIndex, runningAppList, setRunningAppList])

  useEffect(() => {
    console.log('openedEntryList', openedEntryList)
    const openedEntry = openedEntryList[0]
    if (openedEntry) {
      const app = APP_LIST.find(a => a.id === openedEntry.openAppId)!
      handleOpenApp(app)
    }
  }, [openedEntryList, setOpenedEntryList, handleOpenApp])

  return (
    <>
      <div className="fixed z-20 bottom-0 left-1/2 transform -translate-x-1/2 mb-2 p-2 pb-3 bg-white-500 rounded-lg shadow-lg flex bg-hazy-100 border border-gray-500 border-opacity-20 bg-clip-padding">
        {APP_LIST.map(app => {
          const isRunning = !!runningAppList.find(a => a.id === app.id)
          return (
            <div
              key={app.id}
              className="relative mx-2 w-10 h-10"
            >
              <div
                className="filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full bg-no-repeat bg-center bg-contain cursor-pointer"
                title={app.title}
                style={{ backgroundImage: `url("${app.icon}")` }}
                onClick={() => handleOpenApp(app)}
              />
              <span
                className={line(`
                  absolute left-1/2 bottom-0 w-1 h-1 rounded-full bg-black-600
                  transform -translate-x-1/2 translate-y-2
                  transition-all duration-300
                  ${isRunning ? 'opacity-100' : 'opacity-0'}
                `)}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
