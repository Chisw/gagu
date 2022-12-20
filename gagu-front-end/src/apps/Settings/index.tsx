import { useMemo, useState } from 'react'
import { SvgIcon } from '../../components/base'
import { AppComponentProps } from '../../types'
import { line } from '../../utils'
import SystemPanel from './SystemPanel'
import UserPanel from './UserPanel'
import LogPanel from './LogPanel'
import { _t } from '../../i18n'

export interface IPanelProps {
  setWindowLoading: (loading: boolean) => void
}

const tabList = [
  { key: 'system', icon: <SvgIcon.Settings size={14} />, label: _t`title.system`, Panel: SystemPanel },
  { key: 'user', icon: <SvgIcon.User size={14} />, label: _t`title.users`, Panel: UserPanel},
  { key: 'log', icon: <SvgIcon.Booklet size={14} />, label: _t`title.log`, Panel: LogPanel},
]

export default function Settings (props: AppComponentProps) {

  const { setWindowLoading } = props

  const [activeTagKey, setActiveTabKey] = useState('system')

  const Panel = useMemo(() => {
    return tabList.find(t => t.key === activeTagKey)!.Panel
  }, [activeTagKey])

  return (
    <>
      <div className="gg-app-settings absolute inset-0 flex">
        <div className="w-36 h-full flex-shrink-0 select-none">
          {tabList.map(({ key, icon, label }) => (
            <div
              key={key}
              className={line(`
                px-3 py-2 w-full
                text-sm text-gray-700 hover:text-gray-900
                flex items-center
                ${key === activeTagKey
                  ? 'bg-white cursor-default'
                  : 'cursor-pointer'
                }
              `)}
              onClick={() => setActiveTabKey(key)}
            >
              {icon}
              <span className="ml-2">{label}</span>
            </div>
          ))}
        </div>
        <div className="relative w-full h-full bg-white border-l">
          <Panel setWindowLoading={setWindowLoading} />
        </div>
      </div>
    </>
  )
}
