import { ISetting } from '../types'
import service from './service'

export class SettingApi {
  static querySettingAll = async () => {
    const { data } = await service.get('/api/setting')
    return data
  }

  static updateSetting = async (settings: ISetting) => {
    const { data } = await service.put('/api/setting', settings)
    return data
  }

  static getLatestVersion = async () => {
    const { data } = await service.get('/api/setting/version')
    return data
  }

  static updateVersion = async () => {
    const { data } = await service.post('/api/setting/version', undefined, { timeout: 0 })
    return data
  } 
}
