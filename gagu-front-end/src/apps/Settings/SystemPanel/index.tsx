import { TabPane, Tabs } from '@douyinfe/semi-ui'
import { IPanelProps } from '..'
import SysAbout from './SysAbout'

export default function SystemPanel(props: IPanelProps) {

  return (
    <>
      <div className="absolute inset-0 px-2">
        <Tabs type="line">
          <TabPane tab="通用" itemKey="common"></TabPane>
          <TabPane tab="高级" itemKey="advanced"></TabPane>
          <TabPane tab="关于" itemKey="about">
            <SysAbout />
          </TabPane>
        </Tabs>
      </div>
    </>
  ) 
}