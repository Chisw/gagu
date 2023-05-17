import { TabPane, Tabs } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { IPanelProps } from '..'
import GeneralSettings from './GeneralSettings'
import AdvancedSettings from './AdvancedSettings'

export default function SystemPanel(props: IPanelProps) {

  const { t } = useTranslation()

  return (
    <>
      <div className="absolute inset-0 px-4">
        <Tabs lazyRender type="line">
          <TabPane tab={t`title.settings_system_general`} itemKey="general">
            <GeneralSettings />
          </TabPane>
          <TabPane tab={t`title.settings_system_advanced`} itemKey="advanced">
            <AdvancedSettings />
          </TabPane>
        </Tabs>
      </div>
    </>
  ) 
}