import { Collapse } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../../components/common'
import BatteryStatus from './BatteryStatus'

export default function AndroidControlPanel() {
  return (
    <>
      <div className="absolute z-0 inset-0 px-3 md:px-4 py-2 overflow-x-hidden overflow-y-auto">
        <Collapse accordion>
          <Collapse.Panel
            itemKey="battery-status"
            header={(
              <div className="flex items-center">
                <SvgIcon.Battery />
                <span className="ml-2">Battery Status</span>
              </div>
            )}
          >
            <BatteryStatus />
          </Collapse.Panel>
        </Collapse>
        ⏳
      </div>
    </>
  )
}
