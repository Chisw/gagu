import { useState } from 'react'
import { EmptyPanel, SvgIcon } from './common'
import { useRecoilState } from 'recoil'
import { clipboardDataState } from '../states'
import { line } from '../utils'
import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from '.'

export function ClipboardPanel() {

  const { t } = useTranslation()

  const [clipboardData, setClipboardData] = useRecoilState(clipboardDataState)

  const [show, setShow] = useState(false)

  return (
    <>
      <div
        className={line(`
          relative px-1 h-full
          text-xs select-none
          transition-width duration-200
          flex items-center cursor-pointer
          hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10
        `)}
        onClick={() => setShow(true)}
      >
        <SvgIcon.ClipboardSolid className="hidden md:block" />
        <SvgIcon.ClipboardSolid size={18} className="block md:hidden" />
        <span className={`ml-1 font-din ${clipboardData.length ? '' : 'hidden'}`}>
          {clipboardData.length}
        </span>
      </div>

      <SideSheet
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex items-center">
            <SvgIcon.ClipboardSolid size={24} />
            <span className="ml-2 font-din text-base">{clipboardData.length}</span>
            <div className="flex-grow flex justify-end">
              {clipboardData.length > 0 && (
                <Button
                  size="small"
                  icon={<SvgIcon.Brush />}
                  onClick={() => {
                    setClipboardData([])
                    setTimeout(() => setShow(false), 300)
                  }}
                >
                  {t`action.clear`}
                </Button>
              )}
              &nbsp;
              <Button
                type="danger"
                size="small"
                icon={<SvgIcon.Close />}
                className="gagu-sync-popstate-overlay-close-button"
                onClick={() => setShow(false)}
              />
            </div>
          </div>
        )}
        closable={false}
        headerStyle={{ padding: '8px 12px' }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={400}
        visible={show}
        onCancel={() => setShow(false)}
      >
        <div className="relative w-full h-full overflow-auto">
          <EmptyPanel dark show={!clipboardData.length} />
          <div className="mt-3 px-3">
            <ClipboardList />
          </div>
        </div>
      </SideSheet>
    </>
  )
}
