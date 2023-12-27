import { IApp, IEntry, WindowStatus } from '../../types'
import { Rnd } from 'react-rnd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState, topWindowIndexState } from '../../states'
import { WINDOW_DURATION, WINDOW_STATUS_MAP, line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { throttle } from 'lodash-es'

interface WindowProps {
  app: IApp
  addtionalEntryList?: IEntry[]
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
    addtionalEntryList,
  } = props

  const { t } = useTranslation()

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [initIndex] = useState(topWindowIndex)
  const [currentIndex, setCurrentIndex] = useState(initIndex)
  const [windowTitle, setWindowTitle] = useState('')
  const [windowSize, setWindowSize] = useState({ width, height })
  const [hidden, setHidden] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [rndInstance, setRndInstance] = useState<any>(null)
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('opening')
  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  const isTopWindow = useMemo(() => currentIndex === topWindowIndex, [currentIndex, topWindowIndex])
  const sameAppCount = useMemo(() => runningAppList.filter(a => a.id === appId).length, [runningAppList, appId])

  const defaultInfo = useMemo(() => {
    const offset = (sameAppCount - 1) * 24
    const x = Math.max((window.innerWidth - width) / 2, 10) + offset
    const y = Math.max((window.innerHeight - 100 - height) / 2, 10) + offset
    return { x, y, width, height }
  }, [width, height, sameAppCount])

  const [memoInfo, setMemoInfo] = useState(defaultInfo)

  useEffect(() => {
    setTimeout(() => {
      setWindowStatus('opened')
    }, WINDOW_DURATION)
  }, [])

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
    const fill = () => {
      const menuBarHeight = document.querySelector('.gagu-menu-bar')?.scrollHeight || 24
      const dockHeightAndMargin =  48 + 4
      rndInstance.updatePosition({ x: 0, y: menuBarHeight })
      const width = window.innerWidth
      const height = window.innerHeight - menuBarHeight - dockHeightAndMargin
      rndInstance.updateSize({ width, height })  
      setIsFullScreen(true)
      setWindowSize({ width, height })
    }

    const restore = () => {
      const { x, y, width, height } = memoInfo
      rndInstance.updatePosition({ x, y })
      rndInstance.updateSize({ width, height })
      setIsFullScreen(false)
      setWindowSize({ width, height })
    }

    if (force) {
      fill()
    } else {
      isFullScreen ? restore() : fill()
    }
  }, [memoInfo, isFullScreen, rndInstance])

  const handleClose = useCallback(() => {
    setWindowStatus('closing')
    setTimeout(() => {
      const list = runningAppList.filter(a => a.runningId !== runningId)
      setRunningAppList(list)
      setTopWindowIndex(currentIndex - 1)
      setWindowStatus('closed')
    }, WINDOW_DURATION)
  }, [runningAppList, setRunningAppList, runningId, currentIndex, setTopWindowIndex])

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
        className="gagu-app-window"
        default={defaultInfo}
        style={{
          zIndex: initIndex,
          transitionDuration: isDraggingOrResizing ? undefined : '200ms',
        }}
        {...resizeRange}
        onDragStart={() => setIsDraggingOrResizing(true)}
        onResizeStart={() => setIsDraggingOrResizing(true)}
        onDragStop={(e, { x, y }) => {
          setIsDraggingOrResizing(false)
          setMemoInfo({ ...memoInfo, x, y })
        }}
        onResizeStop={(e, d, el, delta) => {
          const { width: dWidth, height: dHeight } = delta
          const width = memoInfo.width + dWidth
          const height = memoInfo.height + dHeight
          setIsDraggingOrResizing(false)
          setWindowSize({ width, height })
          setMemoInfo({ ...memoInfo, width, height })
        }}
      >
        <div
          className={line(`
            gagu-move-to-front-trigger
            absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm overflow-hidden
            transition-box-shadow duration-200 flex flex-col
            dark:bg-black dark:bg-opacity-80
            ${isFullScreen ? '' : 'rounded border border-black border-opacity-10 bg-clip-padding dark:border-white dark:border-opacity-5'}
            ${isTopWindow ? 'shadow-xl' : 'shadow'}
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
              <span
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
              </span>
              <span
                title={isFullScreen ? t`action.fullScreenExit` : t`action.fullScreenEnter`}
                className={line(`
                hover:bg-gray-200 hover:text-black active:bg-gray-400
                  w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                  ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
                `)}
                onClick={() => handleFullScreen()}
              >
                {isFullScreen ? <SvgIcon.FullscreenExit size={12} /> : <SvgIcon.Fullscreen size={12} />}
              </span>
              <span
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
              </span>
            </div>
          </div>
          {/* main */}
          <div className="relative flex-grow overflow-hidden bg-white bg-opacity-30">
            <AppComponent
              isTopWindow={isTopWindow}
              windowSize={windowSize}
              setWindowTitle={setWindowTitle}
              closeWindow={handleClose}
              addtionalEntryList={addtionalEntryList}
            />
          </div>
        </div>
      </Rnd>
    </>
  )
}
