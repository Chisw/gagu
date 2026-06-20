import { IRunningApp } from '../../types'
import { useCallback, useState } from 'react'
import { useRecoilState } from 'recoil'
import { runningAppListState } from '../../states'
import { line } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { useBrowserWindowSize } from '../../hooks'

interface WindowProps {
  app: IRunningApp
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

  const browserWindowSize = useBrowserWindowSize()

  const handleClose = useCallback(() => {
    const list = runningAppList.filter(a => a.runningId !== runningId)
    setRunningAppList(list)
    onClose()
  }, [runningAppList, setRunningAppList, runningId, onClose])

  return (
    <>
      <div
        className={line(`
          gagu-app-window
          absolute z-10 inset-0 top-8 bottom-10 overflow-hidden
          flex flex-col
          dark:bg-black/80
          ${isTopWindow ? '' : 'hidden'}
        `)}
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
          <div className="shrink-0">
            <div
              title={t`action.close`}
              prevent-move-to-front="true"
              className={line(`
                gagu-app-close-trigger
                w-8 h-8 flex-center-center cursor-pointer transition-all duration-200
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
      </div>
    </>
  )
}
