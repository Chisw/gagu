// Sync following code to BE & FE
export interface ISetting {
  port?: string
}

export class SettingForm implements ISetting {
  port = ''

  constructor(settings?: ISetting) {
    this.port = settings?.port || '9293'
  }
}
