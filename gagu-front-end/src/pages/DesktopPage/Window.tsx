import { IApp, IWindowInfo, IEntry, WindowStatus } from '../../types'
import { Rnd, ResizableDelta, Position } from 'react-rnd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState, topWindowIndexState } from '../../states'
import {
  SAME_APP_WINDOW_OFFSET,
  WINDOW_DURATION,
  WINDOW_OPEN_MIN_MARGIN,
  WINDOW_STATUS_MAP,
  line,
} from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { throttle } from 'lodash-es'
import { useUserConfig } from '../../hooks'
import { Dropdown } from '@douyinfe/semi-ui'
import RatioList from './RatioList'
import { getMenuBarHeight } from '../../components'
import { DOCK_HEIGHT_AND_MARGIN } from './Dock'

export const getAppWindowSize = () => {
  const { innerWidth, innerHeight } = window
  const menuBarHeight = getMenuBarHeight()
  const maxHeight = innerHeight - menuBarHeight - DOCK_HEIGHT_AND_MARGIN
  return { maxWidth: innerWidth, maxHeight, menuBarHeight }
}

interface WindowProps {
  app: IApp
  additionalEntryList?: IEntry[]
}

export default function Window(props: WindowProps) {

  const {
    app: {
      id: appId,
      runningId,
      width,
      height,
      resizeRange,
      headerClassName,
      AppComponent,
    },
    additionalEntryList,
  } = props

  const { t } = useTranslation()

  const {
    userConfig,
    setUserConfig,
    userConfig: {
      windowInfoMap,
    },
  } = useUserConfig()

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)

  const [initIndex] = useState(topWindowIndex)
  const [currentIndex, setCurrentIndex] = useState(initIndex)
  const [windowTitle, setWindowTitle] = useState('')
  const [hidden, setHidden] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [rndInstance, setRndInstance] = useState<any>(null)
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('opening')
  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  const isTopWindow = useMemo(() => currentIndex === topWindowIndex, [currentIndex, topWindowIndex])
  const sameAppCount = useMemo(() => runningAppList.filter(a => a.id === appId).length, [runningAppList, appId])

  const defaultInfo = useMemo(() => {
    const offset = (sameAppCount - 1) * SAME_APP_WINDOW_OFFSET
    const storedWindowInfo: IWindowInfo | undefined = windowInfoMap[appId]

    if (storedWindowInfo) {
      const { innerWidth, innerHeight } = window
      const { x, y, width, height } = storedWindowInfo
      const computedX = Math.max(x, 0) + offset
      const computedY = Math.max(y, getMenuBarHeight()) + offset
      const maxX = computedX > innerWidth ? innerWidth - 40 : computedX
      const maxY = computedY > innerHeight ? innerHeight - 40 : computedY

      return {
        x: maxX,
        y: maxY,
        width,
        height,
      }
    } else {
      const x = Math.max((window.innerWidth - width) / 2, WINDOW_OPEN_MIN_MARGIN) + offset
      const y = Math.max((window.innerHeight - height - 50) / 2, WINDOW_OPEN_MIN_MARGIN) + offset
      return { x, y, width, height }
    }
  }, [windowInfoMap, appId, sameAppCount, width, height])

  // for inner app
  const [windowSize, setWindowSize] = useState({ width: defaultInfo.width, height: defaultInfo.height })
  // for restore: no change when window fulling screen
  const [defaultInfoCache, setDefaultInfoCache] = useState<IWindowInfo>(defaultInfo)

  const handleStoreWindowInfo = useCallback((info: IWindowInfo) => {
    setUserConfig({
      ...userConfig,
      windowInfoMap: {
        ...windowInfoMap,
        [appId]: info,
      },
    })
  }, [appId, setUserConfig, userConfig, windowInfoMap])

  const handleMoveToFront = useCallback((e: any) => {
    if (isTopWindow || e.target.closest('[prevent-move-to-front]')) return
    const newTopIndex = topWindowIndex + 1
    setCurrentIndex(newTopIndex)
    setTopWindowIndex(newTopIndex)
    document.getElementById(`gagu-app-window-${runningId}`)!.style.zIndex = String(newTopIndex)
  }, [isTopWindow, runningId, topWindowIndex, setTopWindowIndex])

  const handleHide = useCallback(() => {
    setWindowStatus(hidden ? 'showing' : 'hiding')
    hidden && setHidden(!hidden)
    setTimeout(() => {
      !hidden && setHidden(!hidden)
      setWindowStatus(hidden ? 'shown' : 'hidden')
    }, WINDOW_DURATION)
  }, [hidden])

  const handleFullScreen = useCallback((force?: boolean) => {
    const full = () => {
      const { maxWidth: width, maxHeight: height, menuBarHeight } = getAppWindowSize()

      rndInstance.updatePosition({ x: 0, y: menuBarHeight })
      rndInstance.updateSize({ width, height })

      setWindowSize({ width, height })
      setIsFullScreen(true)
    }

    const restore = () => {
      const { x, y, width, height } = defaultInfoCache
      rndInstance.updatePosition({ x, y })
      rndInstance.updateSize({ width, height })
      setWindowSize({ width, height })
      setIsFullScreen(false)
    }

    if (force) {
      full()
    } else {
      isFullScreen ? restore() : full()
    }
  }, [defaultInfoCache, isFullScreen, rndInstance])

  const handleRatioClick = useCallback((info: IWindowInfo) => {
    const { x, y, width, height } = info

    rndInstance.updatePosition({ x, y })
    rndInstance.updateSize({ width, height })

    setWindowSize({ width, height })
    setDefaultInfoCache(info)
    handleStoreWindowInfo(info)
    setIsFullScreen(false)
  }, [handleStoreWindowInfo, rndInstance])

  const handleClose = useCallback(() => {
    setWindowStatus('closing')
    setTimeout(() => {
      const list = runningAppList.filter(a => a.runningId !== runningId)
      setRunningAppList(list)
      setTopWindowIndex(currentIndex - 1)
      setWindowStatus('closed')
    }, WINDOW_DURATION)
    handleStoreWindowInfo(defaultInfoCache)
  }, [
    handleStoreWindowInfo,
    defaultInfoCache,
    runningAppList,
    setRunningAppList,
    setTopWindowIndex,
    currentIndex,
    runningId,
  ])

  const handleDragStop = useCallback(({ x, y }: { x: number, y: number }) => {
    const info = { ...defaultInfoCache, x, y }
    setDefaultInfoCache(info)
    handleStoreWindowInfo(info)
    setIsDraggingOrResizing(false)
  }, [defaultInfoCache, handleStoreWindowInfo])

  const handleResizeStop = useCallback((delta: ResizableDelta, position: Position) => {
    const { width: deltaWidth, height: deltaHeight } = delta
    const { x, y } = position
    const width = defaultInfoCache.width + deltaWidth
    const height = defaultInfoCache.height + deltaHeight
    const info = { x, y, width, height }
    setWindowSize({ width, height })
    setDefaultInfoCache(info)
    handleStoreWindowInfo(info)
    setIsDraggingOrResizing(false)
  }, [defaultInfoCache, handleStoreWindowInfo])

  useEffect(() => {
    setTimeout(() => {
      setWindowStatus('opened')
    }, WINDOW_DURATION)
  }, [])

  useEffect(() => {
    const listener = throttle(() => {
      if (!isFullScreen) return
      handleFullScreen(true)
    }, 500)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [handleFullScreen, isFullScreen])

  return (
    <>
      <Rnd
        ref={setRndInstance}
        id={`gagu-app-window-${runningId}`}
        dragHandleClassName="gagu-window-drag-handler"
        data-hidden={hidden}
        className={`gagu-app-window ${isTopWindow ? 'is-top-window' : ''}`}
        default={defaultInfo}
        style={{
          zIndex: initIndex,
          transitionDuration: isDraggingOrResizing ? undefined : '200ms',
        }}
        {...resizeRange}
        onDragStart={() => setIsDraggingOrResizing(true)}
        onResizeStart={() => setIsDraggingOrResizing(true)}
        onDragStop={(e, { x, y }) => handleDragStop({ x, y })}
        onResizeStop={(e, d, el, delta, position) => handleResizeStop(delta, position)}
      >
        <div
          className={line(`
            gagu-move-to-front-trigger
            absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm overflow-hidden
            ease-in-out flex flex-col
            dark:bg-black dark:bg-opacity-80
            ${isTopWindow ? 'shadow-xl' : 'shadow'}
            ${isFullScreen
              ? ''
              : 'rounded border border-black border-opacity-10 bg-clip-padding dark:border-white dark:border-opacity-5'
            }
          `)}
          style={WINDOW_STATUS_MAP[windowStatus]}
          onMouseDownCapture={handleMoveToFront}  // click is too late
          onDragEnterCapture={handleMoveToFront}
        >
          {/* header */}
          <div
            className={line(`
              relative w-full h-8 flex items-center select-none group
              ${headerClassName
                ? headerClassName
                : 'bg-white text-gray-500 dark:bg-zinc-800 dark:text-zinc-200'
              }
            `)}
          >
            <div
              className={line(`
                flex items-center flex-grow px-2 h-full truncate
                ${isFullScreen ? '' : 'gagu-window-drag-handler'}
              `)}
              onDoubleClick={() => handleFullScreen()}
            >
              <div
                className="gagu-app-icon flex-shrink-0 w-4 h-4 bg-center bg-no-repeat bg-contain"
                data-app-id={appId}
              />
              <span className="ml-2 text-xs truncate">
                {windowTitle || t(`app.${appId}`)}
              </span>
            </div>
            {/* Mask: prevent out of focus in iframe */}
            <div
              className={line(`
                gagu-window-drag-handler-hover-mask
                absolute z-10 inset-0 mt-8
                ${isTopWindow ? 'hidden' : ''}
              `)}
            />
            <div className="flex items-center flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity duration-100">
              <div
                title={t`action.minimize`}
                prevent-move-to-front="true"
                className={line(`
                  gagu-hidden-switch-trigger
                  w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                hover:bg-gray-200 hover:text-black active:bg-gray-400
                  ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
                `)}
                onClick={handleHide}
              >
                <SvgIcon.Subtract size={12} />
              </div>
              <Dropdown
                trigger="hover"
                position="bottomRight"
                mouseEnterDelay={500}
                content={<RatioList onClick={handleRatioClick} />}
              >
                <div
                  title={isFullScreen ? t`action.fullScreenExit` : t`action.fullScreenEnter`}
                  className={line(`
                  hover:bg-gray-200 hover:text-black active:bg-gray-400
                    w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                    ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
                  `)}
                  onClick={() => handleFullScreen()}
                >
                  {isFullScreen ? <SvgIcon.FullscreenExit size={12} /> : <SvgIcon.Fullscreen size={12} />}
                </div>
              </Dropdown>
              <div
                title={t`action.close`}
                prevent-move-to-front="true"
                className={line(`
                  gagu-app-close-trigger
                  w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                  text-red-500 hover:bg-red-500 hover:text-white active:bg-red-700
                `)}
                onClick={handleClose}
              >
                <SvgIcon.Close />
              </div>
            </div>
          </div>
          {/* main */}
          <div className="relative flex-grow overflow-hidden bg-white bg-opacity-30">
            <AppComponent
              isTopWindow={isTopWindow}
              windowSize={windowSize}
              setWindowTitle={setWindowTitle}
              closeWindow={handleClose}
              additionalEntryList={additionalEntryList}
            />
          </div>
        </div>
      </Rnd>
    </>
  )
}
