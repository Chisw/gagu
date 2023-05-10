import { useMemo, useState } from 'react'
import { SvgIcon } from '../../components/base'
import { AppComponentProps } from '../../types'
import { line } from '../../utils'
import SystemPanel from './SystemPanel'
import UserPanel from './UserPanel'
import LogPanel from './LogPanel'
import { useTranslation } from 'react-i18next'

export interface IPanelProps {
  setWindowLoading: (loading: boolean) => void
}

const tabList = [
  { key: 'system', icon: <SvgIcon.Settings size={14} />, Panel: SystemPanel },
  { key: 'users', icon: <SvgIcon.User size={14} />, Panel: UserPanel},
  { key: 'log', icon: <SvgIcon.Booklet size={14} />, Panel: LogPanel},
]

export default function Settings (props: AppComponentProps) {

  const { setWindowLoading } = props

  const { t } = useTranslation()

  const [activeTagKey, setActiveTabKey] = useState('system')

  const Panel = useMemo(() => {
    return tabList.find(t => t.key === activeTagKey)!.Panel
  }, [activeTagKey])

  return (
    <>
      <div className="gagu-app-settings absolute inset-0 flex">
        <div className="w-36 h-full flex-shrink-0 select-none">
          {tabList.map(({ key, icon }) => (
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
              <span className="ml-2">{t(`title.settings_${key}`)}</span>
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
