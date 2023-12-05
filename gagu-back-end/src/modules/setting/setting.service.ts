import { ISetting, IVersion, SettingKeys } from '../../types'
import { Injectable } from '@nestjs/common'
import { readSettingsData, writeSettingsData } from '../../utils'
import { exec } from 'child_process'

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

  findOne(key: SettingKeys) {
    return this.settings[key]
  }

  update(settings: ISetting) {
    this.settings = settings
    this.sync()
  }

  getLatestVersion() {
    return new Promise((resolve) => {
      exec('npm search gagu', (err, out) => {
        const version: IVersion | undefined = out
          .split('\n')
          .filter(Boolean)
          .map((s) => {
            const [name, , author, date, version] = s
              .split('|')
              .map((s) => s.trim())

            return {
              name,
              author: author.replace('=', ''),
              date,
              version,
            }
          })
          .find((v) => v.name === 'gagu' && v.author === 'chisw')
        resolve(version)
      })
    })
  }

  updateVersion() {
    return new Promise((resolve) => {
      exec('npm i -g gagu', (err, out) => {
        resolve(out)
      })
    })
  }
}
