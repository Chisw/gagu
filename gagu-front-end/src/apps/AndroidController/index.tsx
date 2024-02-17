import { useMemo } from 'react'
import { Collapse } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import { useRecoilState } from 'recoil'
import { baseDataState } from '../../states'
import BatteryStatus from './BatteryStatus'
import Brightness from './Brightness'
import PhoneControl from './PhoneControl'
import CameraControl from './CameraControl'
import ClipboardControl from './ClipboardControl'
import Download from './Download'
import Fingerprint from './Fingerprint'
import InfraredControl from './InfraredControl'
import Dialog from './Dialog'
import Location from './Location'
import MediaPlayer from './MediaPlayer'
import SMSList from './SMSList'

export default function AndroidController() {

  const [baseData] = useRecoilState(baseDataState)

  const panelList = useMemo(() => {
    return [
      { key: 'battery-status', title: 'Battery status', icon: <SvgIcon.Battery />, component: <BatteryStatus /> },
      { key: 'brightness', title: 'Brightness', icon: <SvgIcon.Bulb />, component: <Brightness /> },
      { key: 'phone-control', title: 'Phone', icon: <SvgIcon.Call />, component: <PhoneControl /> },
      { key: 'camera-control', title: 'Camera', icon: <SvgIcon.Camera />, component: <CameraControl /> },
      { key: 'clipboard-control', title: 'Clipboard', icon: <SvgIcon.Clipboard />, component: <ClipboardControl /> },
      { key: 'download', title: 'Download', icon: <SvgIcon.Download />, component: <Download /> },
      { key: 'fingerprint', title: 'Fingerprint', icon: <SvgIcon.Fingerprint />, component: <Fingerprint /> },
      { key: 'infrared-control', title: 'Infrared', icon: <SvgIcon.RemoteControl />, component: <InfraredControl /> },
      { key: 'dialog', title: 'Dialog', icon: <SvgIcon.Dialog />, component: <Dialog /> },
      { key: 'location', title: 'Location', icon: <SvgIcon.Location />, component: <Location /> },
      { key: 'media-player', title: 'MediaPlayer', icon: <SvgIcon.Player />, component: <MediaPlayer /> },
      { key: 'microphone', title: 'Microphone', icon: <SvgIcon.Microphone />, component: <></> },
      { key: 'notifiction', title: 'Notification', icon: <SvgIcon.Notification />, component: <></> },
      { key: 'sensor', title: 'Sensor', icon: <SvgIcon.Sensor />, component: <></> },
      { key: 'share', title: 'Share', icon: <SvgIcon.Share />, component: <></> },
      { key: 'sms', title: 'SMS', icon: <SvgIcon.SMS />, component: <SMSList /> },
      { key: 'toast', title: 'Toast', icon: <SvgIcon.Toast />, component: <></> },
      { key: 'torch', title: 'Torch', icon: <SvgIcon.BulbFlash />, component: <></> },
      { key: 'tts', title: 'TTS', icon: <SvgIcon.Speak />, component: <></> },
      { key: 'usb', title: 'USB', icon: <SvgIcon.USB />, component: <></> },
      { key: 'vibrate', title: 'Vibrate', icon: <SvgIcon.Vibrate />, component: <></> },
      { key: 'volume', title: 'Volume', icon: <SvgIcon.VolumeUp />, component: <></> },
      { key: 'wallpaper', title: 'Wallpaper', icon: <SvgIcon.Image />, component: <></> },
      { key: 'wifi', title: 'WiFi', icon: <SvgIcon.WiFi />, component: <></> },
    ]
  }, [])

  return (
    <>
      <div className="absolute z-0 inset-0 p-2 overflow-x-hidden overflow-y-auto">
        {!baseData.serverOS.isAndroid && (
          <div className="p-2 font-din bg-yellow-300 text-yellow-700 flex">
            <SvgIcon.Warning size={32} className="flex-shrink-0" />
            <div className="ml-2">
              This application is only available when GAGU is running on Termux and Termux:API has been installed, otherwise it will cause a crash.
            </div>
          </div>
        )}
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
