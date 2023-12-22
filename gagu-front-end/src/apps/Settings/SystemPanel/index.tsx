import { TabPane, Tabs } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import GeneralSettings from './GeneralSettings'
import AppsSettings from './AppsSettings'
import AdvancedSettings from './AdvancedSettings'

export default function SystemPanel() {

  const { t } = useTranslation()

  return (
    <>
      <div className="absolute inset-0 px-4 overflow-y-auto">
        <Tabs
          lazyRender
          type="line"
          size="small"
        >
          <TabPane tab={t`title.settings_system_general`} itemKey="general">
            <GeneralSettings />
          </TabPane>
          <TabPane tab={t`title.settings_system_apps`} itemKey="apps">
            <AppsSettings />
          </TabPane>
          <TabPane tab={t`title.settings_system_advanced`} itemKey="advanced">
            <AdvancedSettings />
          </TabPane>
        </Tabs>
      </div>
    </>
  ) 
}