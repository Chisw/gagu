import { readFileSync, writeFileSync } from 'fs'
import { ISetting } from '../types'
import { GAGU_PATH } from './constant.util'
import { JSONFormat } from './fs.util'

export const writeSettingsData = (settings: ISetting) => {
  writeFileSync(GAGU_PATH.DATA_SETTINGS, JSONFormat(settings))
}

export const readSettingsData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_SETTINGS).toString('utf-8')
  const settings: ISetting = JSON.parse(dataStr)
  return settings
}
