import { IApp, WindowStatus } from '../../types'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState } from '../../states'
import { WINDOW_DURATION, WINDOW_STATUS_MAP, line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { useWindowSize } from '../../hooks'

interface WindowProps {
  app: IApp
  isTopWindow: boolean
  onHide: () => void
  onClose: () => void
}

export default function Window(props: WindowProps) {

  const {
    app: {
      id: appId,
      runningId,
      headerClassName,
      AppComponent,
    },
    isTopWindow,
    onHide,
    onClose,
  } = props

  const { t } = useTranslation()

  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [windowTitle, setWindowTitle] = useState('')
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('opening')
  const [hidden, setHidden] = useState(false)

  const windowSize = useWindowSize(true)

  useEffect(() => {
    setTimeout(() => {
      setWindowStatus('opened')
    }, WINDOW_DURATION)
  }, [])

  const handleHide = useCallback(() => {
    setWindowStatus(hidden ? 'showing' : 'hiding')
    hidden && setHidden(!hidden)
    setTimeout(() => {
      !hidden && setHidden(!hidden)
      setWindowStatus(hidden ? 'shown' : 'hidden')
      !hidden && onHide()
    }, WINDOW_DURATION)
  }, [hidden, onHide])

  const handleClose = useCallback(() => {
    setWindowStatus('closing')
    setTimeout(() => {
      const list = runningAppList.filter(a => a.runningId !== runningId)
      setRunningAppList(list)
      setWindowStatus('closed')
      onClose()
    }, WINDOW_DURATION)
  }, [runningAppList, setRunningAppList, runningId, onClose])

  return (
    <>
      <div
        id={`gagu-app-window-${runningId}`}
        className={line(`
          gagu-app-window absolute z-30 inset-0 bg-white bg-opacity-80 backdrop-blur-sm overflow-hidden
          ease-in-out flex flex-col
          dark:bg-black dark:bg-opacity-80
          ${isTopWindow ? 'gagu-is-top-window' : 'hidden'}
        `)}
        data-hidden={hidden}
        style={WINDOW_STATUS_MAP[windowStatus]}
      >
        {/* header */}
        <div
          className={line(`
            relative w-full h-8 flex items-center select-none
            ${headerClassName
              ? headerClassName
              : 'bg-white text-gray-500 dark:bg-zinc-800 dark:text-zinc-200'
            }
          `)}
        >
          <div className="flex items-center flex-grow px-2 h-full truncate">
            <div
              className="gagu-app-icon flex-shrink-0 w-4 h-4 bg-center bg-no-repeat bg-contain"
              data-app-id={appId}
            />
            <span className="ml-2 text-xs truncate">
              {windowTitle || t(`app.${appId}`)}
            </span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <div
              title={t`action.minimize`}
              prevent-move-to-front="true"
              className={line(`
                gagu-hidden-switch-trigger
                w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                bg-black bg-opacity-20 active:bg-opacity-30
                ${headerClassName ? 'text-gray-200' : 'text-gray-400'}
              `)}
              onClick={handleHide}
            >
              <SvgIcon.Subtract size={12} />
            </div>
            <div
              title={t`action.close`}
              prevent-move-to-front="true"
              className={line(`
                gagu-app-close-trigger
                w-8 h-8 flex justify-center items-center cursor-pointer transition-all duration-200
                text-white bg-red-600 hover:bg-red-500 active:bg-red-700
              `)}
              onClick={handleClose}
            >
              <SvgIcon.Close />
            </div>
          </div>
        </div>
        {/* main */}
        <div className="relative flex-grow overflow-hidden bg-black bg-opacity-5">
          <AppComponent
            isTopWindow={isTopWindow}
            windowSize={windowSize}
            setWindowTitle={setWindowTitle}
            closeWindow={handleClose}
          />
        </div>
      </div>
    </>
  )
}
