import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { openedEntryListState, runningAppListState, topWindowIndexState, rootInfoState } from '../../utils/state'
import APP_LIST from '../../utils/appList'
import { IApp } from '../../utils/types'
import { line } from '../../utils'
import { DateTime } from 'luxon'
import useFetch from '../../hooks/useFetch'
import { getRootInfo } from '../../utils/api'
import { DOCUMENT_TITLE } from '../../utils/constant'
import { rootInfoConverter } from '../../utils/converters'
import { Button, Classes, Popover } from '@blueprintjs/core'
import RemixIcon from '../../img/remixicon'

export default function Dock() {

  const [timeStr, setTimerStr] = useState('')

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)

  const { fetch, loading, data } = useFetch(getRootInfo)

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (data) {
      setRootInfo(rootInfoConverter(data))
    }
  }, [data, setRootInfo])

  useEffect(() => {
    document.title = `${rootInfo ? `${rootInfo.deviceName} - ` : ''}${DOCUMENT_TITLE}`
  }, [rootInfo])

  useEffect(() => {
    const tick = () => {
      const now = DateTime.local()
      const str = now.toFormat('HH:mm 星期几<br>yyyy/MM/dd')
      const day = '一二三四五六日'[+now.toFormat('c') - 1]
      setTimerStr(str.replace('星期几', `星期${day}`))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])


  const buttonList = useMemo(() => {
    return [
      {
        text: '关于',
        onClick: () => { },
      },
      {
        text: '进入全屏',
        onClick: () => document.querySelector('html')?.requestFullscreen(),
      },
      {
        text: '刷新',
        onClick: () => fetch(),
      },
      {
        text: '退出',
        onClick: () => { },
      },
    ]
  }, [fetch])

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
      <div className="fixed z-20 right-0 bottom-0 left-0 p-2 bg-white-500 flex justify-between bg-hazy-100 border-t border-gray-500 border-opacity-20 bg-clip-padding">
        <div className="w-24 flex-shrink-0">
          <Popover
            minimal
            position="top-left"
            targetTagName="div"
            popoverClassName="bg-red-500 force-outline-none"
            target={(
              <div className="flex items-center cursor-pointer hover:bg-white-700 hover:text-black active:bg-white-500">
                <span className="text-xs">{loading ? '系统加载中' : `${rootInfo.deviceName}`}</span>
              </div>
            )}
            content={(
              <div className="w-48 p-2">
                {buttonList.map(({ text, onClick }, buttonIndex) => (
                  <Button
                    key={buttonIndex}
                    small
                    minimal
                    alignText="left"
                    className={`w-full ${Classes.POPOVER_DISMISS}`}
                    onClick={onClick}
                  >
                    {text}
                  </Button>
                ))}
                <Button
                  small
                  minimal
                  alignText="left"
                  className="w-full"
                  icon={<RemixIcon.GitHub />}
                  onClick={() => window.open('https://github.com/Chisw/gagu')}
                >
                  GitHub
                </Button>
              </div>
            )}
          />
        </div>
        <div className="flex items-center">
          {APP_LIST.map(app => {
            const isRunning = !!runningAppList.find(a => a.id === app.id)
            return (
              <div
                key={app.id}
                className="relative mx-2 w-6 h-6"
              >
                <div
                  className="filter hover:brightness-110 active:brightness-75 transition-all duration-50 w-full h-full bg-no-repeat bg-center bg-contain cursor-pointer"
                  title={app.title}
                  style={{ backgroundImage: `url("${app.icon}")` }}
                  onClick={() => handleOpenApp(app)}
                />
                <span
                  className={line(`
                    absolute left-1/2 bottom-0 w-3 h-1 rounded-full bg-green-500
                    transform -translate-x-1/2 translate-y-2
                    transition-all duration-300
                    ${isRunning ? 'opacity-100' : 'opacity-0'}
                  `)}
                />
              </div>
            )
          })}
        </div>
        <div className="w-24 flex-shrink-0 text-center text-xs leading-tight">
          <span
            className="font-din"
            dangerouslySetInnerHTML={{ __html: timeStr }}
          />
        </div>
      </div>
    </>
  )
}
