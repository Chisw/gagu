import { ISetting } from '../types'
import { GAGU_PATH } from './constant.util'
import { readJSONData, writeJSONData } from './fs.util'

export const writeSettingsData = (settings: ISetting) => {
  writeJSONData(GAGU_PATH.DATA_SETTINGS, settings)
}

export const readSettingsData = () => {
  const settings = readJSONData<ISetting>(GAGU_PATH.DATA_SETTINGS)
  return settings
}
