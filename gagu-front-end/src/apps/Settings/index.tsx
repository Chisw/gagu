import { useMemo, useState } from 'react'
import { SvgIcon } from '../../components/common'
import { AppComponentProps } from '../../types'
import { line } from '../../utils'
import SystemPanel from './SystemPanel'
import UserPanel from './UserPanel'
import LogPanel from './LogPanel'
import { useTranslation } from 'react-i18next'
import { TabPane, Tabs } from '@douyinfe/semi-ui'

const tabList = [
  { key: 'system', icon: <SvgIcon.Settings size={14} />, Panel: SystemPanel },
  { key: 'users', icon: <SvgIcon.Users size={14} />, Panel: UserPanel },
  { key: 'log', icon: <SvgIcon.Booklet size={14} />, Panel: LogPanel},
]

export default function Settings (props: AppComponentProps) {

  const { t } = useTranslation()

  const [activeTagKey, setActiveTabKey] = useState('system')

  const Panel = useMemo(() => {
    return tabList.find(t => t.key === activeTagKey)!.Panel
  }, [activeTagKey])

  return (
    <>
      <div className="gagu-app-settings absolute inset-0 flex flex-col md:flex-row">
        <div className="hidden md:block w-48 border-r h-full flex-shrink-0 select-none dark:border-zinc-700">
          {tabList.map(({ key, icon }) => (
            <div
              key={key}
              className={line(`
                px-3 py-2 w-full border-l-4
                text-sm text-gray-700 hover:text-gray-900
                flex items-center
                transition-all duration-200
                ${key === activeTagKey
                  ? 'border-blue-500 bg-white text-black dark:bg-zinc-800 dark:text-zinc-200 dark:hover:text-zinc-200'
                  : 'border-transparent text-gray-600 hover:text-black cursor-pointer dark:text-zinc-200 dark:hover:text-white'
                }
              `)}
              onClick={() => setActiveTabKey(key)}
            >
              {icon}
              <span className="ml-2">{t(`title.settings_${key}`)}</span>
            </div>
          ))}
        </div>
        <div className="md:hidden pt-2 flex-shrink-0 select-none bg-white dark:bg-zinc-800">
          <Tabs
            collapsible
            type="card"
            onChange={setActiveTabKey}
          >
              {tabList.map(({ key, icon }) => (
                <TabPane
                  key={key}
                  itemKey={key}
                  tab={(
                    <div className="flex items-center">
                      {icon}
                      <span className="ml-2">{t(`title.settings_${key}`)}</span>
                    </div>
                  )}
                />
              ))}
          </Tabs>
        </div>
        <div className="relative w-full h-full bg-white dark:bg-zinc-800">
          <Panel />
        </div>
      </div>
    </>
  )
}
