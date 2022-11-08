import { ISetting, SettingKeys } from '../../types'
import { Injectable } from '@nestjs/common'
import { readSettingsData, writeSettingsData } from '../../utils'

@Injectable()
export class SettingService {
  private settings: ISetting = {}

  constructor() {
    console.log('  - init Setting')
    this.settings = readSettingsData()
  }

  sync() {
    writeSettingsData(this.settings)
  }

  findAll() {
    return this.settings
  }

  findOne(key: SettingKeys) {
    return this.settings[key]
  }

  update(settings: ISetting) {
    this.settings = settings
    this.sync()
  }
}
