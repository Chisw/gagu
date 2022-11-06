import { ISetting } from '../../types'
import { Injectable } from '@nestjs/common'
import { readSettingsData, writeSettingsData } from '../../utils'

@Injectable()
export class SettingService {
  private settings: ISetting = {}

  constructor() {
    this.settings = readSettingsData()
  }

  sync() {
    writeSettingsData(this.settings)
  }

  findAll() {
    return this.settings
  }

  update(settings: ISetting) {
    this.settings = settings
    this.sync()
  }
}
