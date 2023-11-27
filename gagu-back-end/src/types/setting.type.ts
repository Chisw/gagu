// Sync following code to BE & FE
export enum SettingKey {
  host = 'host',
  port = 'port',
  deviceName = 'deviceName',
}

export type SettingKeys = keyof typeof SettingKey

export interface ISetting {
  [SettingKey.host]?: string
  [SettingKey.port]?: string
  [SettingKey.deviceName]?: string
}

export class SettingForm implements ISetting {
  host = ''
  port = ''
  deviceName = ''

  constructor(settings?: ISetting) {
    this.host = settings?.host || ''
    this.port = settings?.port || ''
    this.deviceName = settings?.deviceName || ''
  }
}
