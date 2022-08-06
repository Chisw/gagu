import { IApp } from '../../utils/types'
import { Rnd } from 'react-rnd'
import { CenterToFit16, Close16, FitToScreen16, Subtract16 } from '@carbon/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState, topWindowIndexState } from '../../utils/state'
import { line } from '../../utils'

const SAME_CLASS_NAME = `w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200`

interface WindowProps {
  app: IApp
}

export default function Window(props: WindowProps) {

  const {
    app: {
      runningId,
      title,
      icon,
      bgImg,
      width,
      height,
      resizeRange,
      AppComponent,
    },
  } = props

  const defaultInfo = useMemo(() => {
    const x = Math.max((window.innerWidth * 3 - width) / 2, 10)
    const y = Math.max((window.innerHeight - 100 - height) / 2, 10)
    return { x, y, width, height }
  }, [width, height])

  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [initIndex] = useState(topWindowIndex)
  const [currentIndex, setCurrentIndex] = useState(initIndex)
  const [windowLoading, setWindowLoading] = useState(false)
  const [windowTitle, setWindowTitle] = useState('')
  const [hidden, setHidden] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [memoInfo, setMemoInfo] = useState(defaultInfo)
  const [rndInstance, setRndInstance] = useState<any>(null)

  const isTopWindow = useMemo(() => currentIndex === topWindowIndex, [currentIndex, topWindowIndex])

  const handleMoveToFront = useCallback((e) => {
    if (isTopWindow || e.target.closest('[prevent-move-to-front]')) return
    const newTopIndex = topWindowIndex + 1
    setCurrentIndex(newTopIndex)
    setTopWindowIndex(newTopIndex)
    document.getElementById(`window-${runningId}`)!.style.zIndex = String(newTopIndex)
  }, [isTopWindow, runningId, topWindowIndex, setTopWindowIndex])

  const handleZoom = useCallback(() => {
    if (isFullScreen) {
      const { x, y, width, height } = memoInfo
      rndInstance.updatePosition({ x, y})
      rndInstance.updateSize({ width, height })
      setIsFullScreen(false)
    } else {
      rndInstance.updatePosition({ x: window.innerWidth, y: 0 })
      rndInstance.updateSize({ width: window.innerWidth, height: window.innerHeight - 94 })
      setIsFullScreen(true)
    }
  }, [memoInfo, isFullScreen, rndInstance])

  const handleClose = useCallback(() => {
    const list = runningAppList.filter(a => a.runningId !== runningId)
    setRunningAppList(list)
    setTopWindowIndex(currentIndex - 1)
  }, [runningAppList, setRunningAppList, runningId, currentIndex, setTopWindowIndex])

  return (
    <>
      <Rnd
        ref={setRndInstance}
        id={`window-${runningId}`}
        dragHandleClassName="drag-handler"
        bounds="#app-container"
        data-hidden={hidden}
        className="app-window"
        default={defaultInfo}
        style={{ zIndex: initIndex }}
        {...resizeRange}
        onResizeStop={(e, d, el, delta) => {
          setMemoInfo({
            ...memoInfo,
            width: memoInfo.width + delta.width,
            height: memoInfo.height + delta.height,
          })
        }}
        onDragStop={(e, { x, y }) => {
          setMemoInfo({ ...memoInfo, x, y })
        }}
      >
        <div
          className={line(`
            move-to-front-trigger
            absolute inset-0 bg-white-700 bg-hazy-100 rounded-lg overflow-hidden
            border border-gray-500 border-opacity-30 bg-clip-padding
            transition-box-shadow duration-200 flex flex-col
            ${isTopWindow ? 'shadow-xl' : 'shadow'}
          `)}
          onMouseDownCapture={handleMoveToFront}  // click is too late
        >
          {/* header */}
          <div
            className={line(`
              w-full h-8 flex items-center select-none
              ${windowLoading ? 'bg-loading' : 'bg-gradient-to-b from-transparent to-gray-200'}
              ${isTopWindow ? '' : 'filter grayscale opacity-60'}
            `)}
          >
            <div
              className="drag-handler flex items-center flex-shrink-0 flex-grow px-2 h-full"
              onDoubleClick={handleZoom}
            >
              <div
                className="w-4 h-4 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url("${icon}")` }}
              />
              <span className="ml-2 text-gray-500 text-sm">
                {windowTitle || title}
              </span>
            </div>
            {/* Mask: prevent out of focus in iframe */}
            <div
              className={line(`
                drag-handler-hover-mask
                absolute z-10 inset-0 mt-8
                ${isTopWindow ? 'hidden' : ''}
              `)}
            />
            <div className="flex items-center flex-shrink-0">
              <span
                title="最小化"
                prevent-move-to-front="true"
                className={line(`
                  hidden-switch-trigger
                  text-gray-400 hover:bg-gray-200 hover:text-black active:bg-gray-400
                  ${SAME_CLASS_NAME}
                `)}
                onClick={() => setHidden(!hidden)}
              >
                <Subtract16 />
              </span>
              <span
                title={isFullScreen ? '窗口' : '全屏'}
                className={line(`
                  text-gray-400 hover:bg-gray-200 hover:text-black active:bg-gray-400
                  ${SAME_CLASS_NAME}
                `)}
                onClick={handleZoom}
              >
                {isFullScreen ? <CenterToFit16 /> : <FitToScreen16 />}
              </span>
              <span
                title="关闭"
                prevent-move-to-front="true"
                className={line(`
                  text-red-500 hover:bg-red-500 hover:text-white active:bg-red-700
                  ${SAME_CLASS_NAME}
                `)}
                onClick={handleClose}
              >
                <Close16 />
              </span>
            </div>
          </div>
          {/* main */}
          <div
            className="relative flex-grow overflow-hidden bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: bgImg ? `url("${bgImg}")` : undefined }}
          >
            <AppComponent
              isTopWindow={isTopWindow}
              setWindowLoading={setWindowLoading}
              setWindowTitle={setWindowTitle}
            />
          </div>
        </div>
      </Rnd>
    </>
  )
}
