import { EntryType, EventTransaction } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from './SvgIcon'
import { line } from '../../utils'
import { useEffect, useState } from 'react'
import { EntryPicker, EntryPickerMode } from '../EntryPicker'
import { openEventState } from '../../states'
import { useRecoilState } from 'recoil'

interface OpenerProps {
  show: boolean
  appId: string
}

export function Opener(props: OpenerProps) {
  const {
    show,
    appId,
  } = props

  const { t } = useTranslation()

  const [, setOpenEvent] = useRecoilState(openEventState)

  const [mounted, setMounted] = useState(false)
  const [openerEntryPickerShow, setOpenerEnteryPickerShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 400)
  }, [])

  return (
    <>
      <div
        className={line(`
          absolute z-50 inset-0
          justify-center items-center
          ${show ? 'flex' : 'hidden'}
        `)}
      >
        <div className="pb-4">
          <div
            data-app-id={appId}
            className={line(`
              gagu-app-icon mx-auto w-24 h-24
              transition-all duration-500 ease-in-out
              ${mounted ? '-rotate-3' : 'rotate-6 translate-y-10 opacity-0 scale-50'}
            `)}
          />
          <div
            className={line(`
              flex justify-center items-center
              mt-12 p-2 w-36 border select-none
              cursor-pointer rounded bg-white bg-opacity-90
              text-xs text-gray-600 hover:text-gray-900 hover:opacity-80
              transition-all
              dark:bg-zinc dark:bg-opacity-20 dark:border-zinc-400 dark:border-opacity-20 dark:text-zinc-200
              ${mounted ? 'duration-200' : 'duration-700 opacity-0'}
            `)}
            onClick={() => setOpenerEnteryPickerShow(true)}
          >
            <SvgIcon.FolderOpen size={14} />
            <span className="ml-2">{t`action.openFile`}</span>
          </div>
        </div>
      </div>

      <EntryPicker
        show={openerEntryPickerShow}
        appId={appId}
        mode={EntryPickerMode.open}
        type={EntryType.file}
        title={t`action.open`}
        onConfirm={({ pickedEntryList }) => {
          setOpenEvent({
            transaction: EventTransaction.run_app,
            appId,
            entryList: pickedEntryList,
          })
          setOpenerEnteryPickerShow(false)
        }}
        onCancel={() => setOpenerEnteryPickerShow(false)}
      />
    </>
  )
}
