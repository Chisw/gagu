import { useMemo } from 'react'
import { Collapse } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import BatteryStatus from './BatteryStatus'
import Brightness from './Brightness'
import CallLog from './CallLog'
import CameraControl from './CameraControl'

export default function AndroidController() {

  const panelList = useMemo(() => {
    return [
      { key: 'battery-status', title: 'Battery status', icon: <SvgIcon.Battery />, component: <BatteryStatus /> },
      { key: 'brightness', title: 'Brightness', icon: <SvgIcon.Bulb />, component: <Brightness /> },
      { key: 'call-log', title: 'Call log', icon: <SvgIcon.Call />, component: <CallLog /> },
      { key: 'camera-control', title: 'Camera', icon: <SvgIcon.Camera />, component: <CameraControl /> },
    ]
  }, [])

  return (
    <>
      <div className="absolute z-0 inset-0 px-3 md:px-4 py-2 overflow-x-hidden overflow-y-auto">
        <div className="mb-2 p-2 text-center text-xs bg-yellow-100 font-din rounded">
          ⏳ Developing
        </div>
        <Collapse accordion>
          {panelList.map(({ key, title, icon, component }) => (
            <Collapse.Panel
              key={key}
              itemKey={key}
              header={(
                <div className="flex items-center select-none">
                  {icon}
                  <span className="ml-2">{title}</span>
                </div>
              )}
            >
              {component}
            </Collapse.Panel>
          ))}

        </Collapse>
      </div>
    </>
  )
}
