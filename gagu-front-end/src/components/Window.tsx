import { IApp } from '../types'
import { Rnd } from 'react-rnd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState, topWindowIndexState } from '../states'
import { line } from '../utils'
import { SvgIcon } from './base'
import { useTranslation } from 'react-i18next'

const SAME_CLASS_NAME = `w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200`
const DURATION = 200

interface WindowProps {
  app: IApp
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
  } = props

  const { t } = useTranslation()

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [initIndex] = useState(topWindowIndex)
  const [currentIndex, setCurrentIndex] = useState(initIndex)
  const [windowLoading, setWindowLoading] = useState(false)
  const [windowTitle, setWindowTitle] = useState('')
  const [windowSize, setWindowSize] = useState({ width, height })
  const [hidden, setHidden] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [rndInstance, setRndInstance] = useState<any>(null)
  const [windowStatus, setWindowStatus] = useState<'opening' | 'opened' | 'hiding' | 'hidden' | 'showing' | 'shown' | 'closing' | 'closed'>('closed')
  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  const isTopWindow = useMemo(() => currentIndex === topWindowIndex, [currentIndex, topWindowIndex])
  const sameAppCount = useMemo(() => runningAppList.filter(a => a.id === appId).length, [runningAppList, appId])

  const defaultInfo = useMemo(() => {
    const offset = sameAppCount * 24
    const x = Math.max((window.innerWidth - width) / 2, 10) + offset
    const y = Math.max((window.innerHeight - 100 - height) / 2, 10) + offset
    return { x, y, width, height }
  }, [width, height, sameAppCount])

  const [memoInfo, setMemoInfo] = useState(defaultInfo)

  useEffect(() => {
    setWindowStatus('opening')
    setTimeout(() => {
      setWindowStatus('opened')
    }, DURATION)
  }, [])

  const transformStyle = useMemo(() => {
    return {
      opening: { transition: 'none', transitionDuration: '0', transform: 'perspective(1000px) rotateX(-30deg) scale(.6)', opacity: 0 },
      opened: { transition: 'all', transitionDuration: `${DURATION}ms`, transform: '', opacity: 1 },
      hiding: { transition: 'all', transitionDuration: `${DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
      hidden: { transition: 'all', transitionDuration: `${DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
      showing: { transition: 'all', transitionDuration: '0', transform: 'perspective(1000px) rotateX(0) scale(1) translateY(20vh)', opacity: 0 },
      shown: { transition: 'all', transitionDuration: `${DURATION}ms`, transform: 'perspective(1000px) rotateX(0) scale(1) translateY(0)', opacity: 1 },
      closing: { transition: 'all', transitionDuration: `${DURATION}ms`, transform: 'perspective(1000px) rotateX(-30deg) scale(.6)', opacity: 0 },
      closed: undefined,
    }[windowStatus]
  }, [windowStatus])

  const handleMoveToFront = useCallback((e) => {
    if (isTopWindow || e.target.closest('[prevent-move-to-front]')) return
    const newTopIndex = topWindowIndex + 1
    setCurrentIndex(newTopIndex)
    setTopWindowIndex(newTopIndex)
    document.getElementById(`gg-app-window-${runningId}`)!.style.zIndex = String(newTopIndex)
  }, [isTopWindow, runningId, topWindowIndex, setTopWindowIndex])

  const handleHide = useCallback(() => {
    setWindowStatus(hidden ? 'showing' : 'hiding')
    hidden && setHidden(!hidden)
    setTimeout(() => {
      !hidden && setHidden(!hidden)
      setWindowStatus(hidden ? 'shown' : 'hidden')
    }, DURATION)
  }, [hidden])

  const handleFullScreen = useCallback(() => {
    if (isFullScreen) {
      const { x, y, width, height } = memoInfo
      rndInstance.updatePosition({ x, y })
      rndInstance.updateSize({ width, height })
      setIsFullScreen(false)
      setWindowSize({ width, height })
    } else {
      rndInstance.updatePosition({ x: 0, y: 24 })  // MenuBar height
      const width = window.innerWidth
      const height = window.innerHeight - 48 - 24  // Dock height
      rndInstance.updateSize({ width, height })  
      setIsFullScreen(true)
      setWindowSize({ width, height })
    }
  }, [memoInfo, isFullScreen, rndInstance])

  const handleClose = useCallback(() => {
    setWindowStatus('closing')
    setTimeout(() => {
      const list = runningAppList.filter(a => a.runningId !== runningId)
      setRunningAppList(list)
      setTopWindowIndex(currentIndex - 1)
      setWindowStatus('closed')
    }, DURATION)
  }, [runningAppList, setRunningAppList, runningId, currentIndex, setTopWindowIndex])

  return (
    <>
      <Rnd
        ref={setRndInstance}
        id={`gg-app-window-${runningId}`}
        dragHandleClassName="gg-drag-handler"
        data-hidden={hidden}
        className="gg-app-window"
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
            gg-move-to-front-trigger
            absolute inset-0 bg-white-800 backdrop-filter backdrop-blur-sm overflow-hidden
            transition-box-shadow duration-200 flex flex-col
            ${isFullScreen ? '' : 'rounded-md border border-gray-500 border-opacity-30 bg-clip-padding'}
            ${isTopWindow ? 'shadow-xl' : 'shadow'}
          `)}
          style={transformStyle}
          onMouseDownCapture={handleMoveToFront}  // click is too late
        >
          {/* header */}
          <div
            className={line(`
              relative w-full h-8 flex items-center select-none border-b
              ${headerClassName || 'bg-white text-gray-500'}
            `)}
          >
            {windowLoading && (<div className="absolute z-0 right-0 bottom-0 left-0 h-2px bg-loading" />)}
            <div
              className="gg-drag-handler flex items-center flex-grow px-2 h-full truncate"
              onDoubleClick={handleFullScreen}
            >
              <div
                className="gg-app-icon w-4 h-4 bg-center bg-no-repeat bg-contain"
                data-app-id={appId}
              />
              <span className="ml-2 text-xs">
                {windowTitle || t(`app.${appId}`)}
              </span>
            </div>
            {/* Mask: prevent out of focus in iframe */}
            <div
              className={line(`
                gg-drag-handler-hover-mask
                absolute z-10 inset-0 mt-8
                ${isTopWindow ? 'hidden' : ''}
              `)}
            />
            <div className="flex items-center flex-shrink-0">
              <span
                title="最小化"
                prevent-move-to-front="true"
                className={line(`
                  gg-hidden-switch-trigger
                hover:bg-gray-200 hover:text-black active:bg-gray-400
                  ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
                  ${SAME_CLASS_NAME}
                `)}
                onClick={handleHide}
              >
                <SvgIcon.Subtract size={12} />
              </span>
              <span
                title={isFullScreen ? '退出全屏' : '全屏'}
                className={line(`
                hover:bg-gray-200 hover:text-black active:bg-gray-400
                  ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
                  ${SAME_CLASS_NAME}
                `)}
                onClick={handleFullScreen}
              >
                {isFullScreen ? <SvgIcon.FullscreenExit size={12} /> : <SvgIcon.Fullscreen size={12} />}
              </span>
              <span
                title="关闭"
                prevent-move-to-front="true"
                className={line(`
                  gg-app-close-trigger
                  text-red-500 hover:bg-red-500 hover:text-white active:bg-red-700
                  ${SAME_CLASS_NAME}
                `)}
                onClick={handleClose}
              >
                <SvgIcon.Close />
              </span>
            </div>
          </div>
          {/* main */}
          <div className="relative flex-grow overflow-hidden bg-black-50">
            <AppComponent
              isTopWindow={isTopWindow}
              windowSize={windowSize}
              setWindowLoading={setWindowLoading}
              setWindowTitle={setWindowTitle}
            />
          </div>
        </div>
      </Rnd>
    </>
  )
}
