// Sync following code to BE & FE
export interface ISetting {
  port?: string
  deviceName?: string
}

export class SettingForm implements ISetting {
  port = ''
  deviceName = ''

  constructor(settings?: ISetting) {
    this.port = settings?.port || ''
    this.deviceName = settings?.deviceName || ''
  }
}
