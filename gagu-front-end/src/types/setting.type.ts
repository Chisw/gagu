// Sync following code to BE & FE
export enum SettingKey {
  port = 'port',
  deviceName = 'deviceName',
}

export type SettingKeys = keyof typeof SettingKey

export interface ISetting {
  [SettingKey.port]?: string
  [SettingKey.deviceName]?: string
}

export class SettingForm implements ISetting {
  port = ''
  deviceName = ''

  constructor(settings?: ISetting) {
    this.port = settings?.port || ''
    this.deviceName = settings?.deviceName || ''
  }
}
