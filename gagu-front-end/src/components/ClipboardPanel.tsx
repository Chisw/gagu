import { useMemo, useState } from 'react'
import { EmptyPanel, SvgIcon } from './common'
import { useRecoilState } from 'recoil'
import { clipboardDataState } from '../states'
import { line } from '../utils'
import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { ClipboardType, IEntry } from '../types'
import EntryNode from '../apps/FileExplorer/EntryNode'
import { useUserConfig } from '../hooks'

export function ClipboardPanel() {

  const { t } = useTranslation()

  const { userConfig: { kiloSize } } = useUserConfig()

  const [clipboardData, setClipboardData] = useRecoilState(clipboardDataState)

  const [show, setShow] = useState(false)

  const { type, entryList, count } = useMemo(() => {
    const { type, entryList = [] } = clipboardData || {}
    const count = entryList.length
    return { type, entryList, count }
  }, [clipboardData])

  return (
    <>
      <div
        className={line(`
          relative px-2 h-full
          text-xs select-none
          transition-width duration-200
          items-center cursor-pointer
          hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10
          ${count ? 'flex' : 'hidden'}
        `)}
        onClick={() => setShow(true)}
      >
        {type === ClipboardType.copy && (
          <>
            <SvgIcon.Copy className="hidden md:block" />
            <SvgIcon.Copy size={18} className="block md:hidden" />
          </>
        )}
        {type === ClipboardType.cut && (
          <>
            <SvgIcon.Cut className="hidden md:block" />
            <SvgIcon.Cut size={18} className="block md:hidden" />
          </>
        )}
        <span className={`ml-1 font-din ${count ? '' : 'hidden'}`}>
          {count}
        </span>
      </div>

      <SideSheet
        data-customized-scrollbar
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex items-center">
            {type === ClipboardType.copy && <SvgIcon.Copy size={20} />}
            {type === ClipboardType.cut && <SvgIcon.Cut size={20} />}
            <span className="ml-2 font-din text-base">{count}</span>
            <div className="flex-grow flex justify-end">
              {count > 0 && (
                <Button
                  size="small"
                  icon={<SvgIcon.Brush />}
                  onClick={() => {
                    setClipboardData(null)
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
          <EmptyPanel dark show={!clipboardData} />
          <div
            className={line(`
              py-2 bg-white bg-opacity-70
              dark:bg-black dark:bg-opacity-10
              ${entryList.length ? '' : 'hidden'}
            `)}
          >
            {entryList.map((entry: IEntry) => (
              <EntryNode
                key={entry.parentPath + entry.name}
                hideAppIcon
                gridMode={false}
                entry={entry}
                kiloSize={kiloSize}
              />
            ))}
          </div>
        </div>
      </SideSheet>
    </>
  )
}
