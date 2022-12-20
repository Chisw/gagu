import { TabPane, Tabs } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { IPanelProps } from '..'
import AdvancedSettings from './AdvancedSettings'

export default function SystemPanel(props: IPanelProps) {

  const { t } = useTranslation()

  return (
    <>
      <div className="absolute inset-0 px-4">
        <Tabs type="line">
          <TabPane tab={t`title.general`} itemKey="general">
            ⏳
          </TabPane>
          <TabPane tab={t`title.advanced`} itemKey="advanced">
            <AdvancedSettings />
          </TabPane>
        </Tabs>
      </div>
    </>
  ) 
}