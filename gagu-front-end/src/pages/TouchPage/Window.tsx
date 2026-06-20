import { IRunningApp } from '../../types'
import { useCallback, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState } from '../../states'
import { line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { useBrowserWindowSize } from '../../hooks'
import { motion } from 'motion/react'

interface WindowProps {
  app: IRunningApp
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

  const [, setRunningAppList] = useRecoilState(runningAppListState)
  const [windowTitle, setWindowTitle] = useState('')
  const [hidden, setHidden] = useState(false)

  const browserWindowSize = useBrowserWindowSize()

  const handleHide = useCallback(() => {
    setHidden(h => !h)
    !hidden && onHide()
  }, [hidden, onHide])

  const handleClose = useCallback(() => {
    setRunningAppList((list) => list.filter(a => a.runningId !== runningId))
    onClose()
  }, [setRunningAppList, runningId, onClose])

  return (
    <>
      <motion.div
        id={`gagu-app-window-${runningId}`}
        className={line(`
          gagu-app-window absolute z-30 inset-0 overflow-hidden
          ease-in-out flex flex-col
          dark:bg-black/80
          ${isTopWindow ? 'gagu-is-top-window' : 'hidden'}
        `)}
        data-hidden={hidden}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={hidden ? { y: '20vh', scale: 1, opacity: 0, display: 'none', transition: { display: { delay: 0.2 } } } : { y: 0, scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
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
          <div className="flex items-center grow px-2 h-full truncate">
            <div
              className="gagu-app-icon shrink-0 w-4 h-4 bg-center bg-no-repeat bg-contain"
              data-app-id={appId}
            />
            <span className="ml-2 text-xs truncate">
              {windowTitle || t(`app.${appId}`)}
            </span>
          </div>
          <div className="flex items-center shrink-0">
            <div
              title={t`action.minimize`}
              prevent-move-to-front="true"
              className={line(`
                gagu-hidden-switch-trigger
                flex-center-center
                w-8 h-8 cursor-pointer transition-all duration-200
                bg-black/20 active:bg-opacity-30
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
                flex-center-center
                w-8 h-8 cursor-pointer transition-all duration-200
                text-white bg-red-600 hover:bg-red-500 active:bg-red-700
              `)}
              onClick={handleClose}
            >
              <SvgIcon.Close />
            </div>
          </div>
        </div>
        {/* main */}
        <div className="relative grow overflow-hidden bg-black/5">
          <AppComponent
            isTopWindow={isTopWindow}
            appWindowSize={browserWindowSize}
            setWindowTitle={setWindowTitle}
            closeWindow={handleClose}
          />
        </div>
      </motion.div>
    </>
  )
}
