import { ISetting, SettingKeys } from '@shared'
import { Injectable } from '@nestjs/common'
import { DataManager } from '@/utils'
import { exec } from 'node:child_process'

@Injectable()
export class SettingService {
  private settings: ISetting = {}

  constructor() {
    this.settings = DataManager.settings.read()
  }

  sync() {
    DataManager.settings.write(this.settings)
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
    return new Promise((resolve, reject) => {
      exec('npm view gagu version', (err, version) => {
        if (err) {
          reject(err)
          return
        }
        resolve(version.trim())
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
