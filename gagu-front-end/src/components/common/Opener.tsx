import { useRecoilState } from 'recoil'
import { entrySelectorEventState } from '../../states'
import { EntryType, EventTransaction } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from './SvgIcon'
import { line } from '../../utils'
import { useEffect, useState } from 'react'

interface OpenerProps {
  appId: string
}

export function Opener(props: OpenerProps) {
  const {
    appId,
  } = props

  const { t } = useTranslation()

  const [, setEntrySelectorEvent] = useRecoilState(entrySelectorEventState)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 400)
  }, [])

  return (
    <>
      <div className="absolute z-50 inset-0 flex justify-center items-center">
        <div className="pb-12">
          <div
            data-app-id={appId}
            className={line(`
              gagu-app-icon mx-auto w-24 h-24
              transition-all duration-500 ease-in-out
              ${mounted ? '-rotate-3' : 'rotate-6 translate-y-10 opacity-0 scale-50'}
            `)}
          />
          <div>
            <div
              className={line(`
                flex justify-center items-center
                mt-12 p-2 w-36 border
                cursor-pointer rounded bg-white bg-opacity-90
                text-xs text-gray-600 hover:text-gray-900 hover:opacity-80
                transition-all
                dark:bg-zinc dark:bg-opacity-20 dark:border-zinc-400 dark:border-opacity-20 dark:text-zinc-200
                ${mounted ? 'duration-200' : 'duration-700 opacity-0'}
              `)}
              onClick={() => {
                setEntrySelectorEvent({
                  transaction: EventTransaction.run_app,
                  mode: 'open',
                  appId,
                  type: EntryType.file,
                })
              }}
            >
              <SvgIcon.FolderOpen size={14} />
              <span className="ml-2">{t`action.openFile`}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
