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
    onClose,
  } = props

  const { t } = useTranslation()

  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)
  const [windowTitle, setWindowTitle] = useState('')
  const [windowStatus, setWindowStatus] = useState<WindowStatus>('opening')

  const windowSize = useWindowSize(false)

  useEffect(() => {
    setTimeout(() => {
      setWindowStatus('opened')
    }, WINDOW_DURATION)
  }, [])

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
        className={line(`
          gagu-app-window absolute z-10 inset-0 top-8 md:top-6 bottom-10 bg-white bg-opacity-80 backdrop-blur-sm overflow-hidden
          ease-in-out flex flex-col
          dark:bg-black dark:bg-opacity-80
          ${isTopWindow ? '' : 'hidden'}
        `)}
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
          <div className="flex-shrink-0">
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
