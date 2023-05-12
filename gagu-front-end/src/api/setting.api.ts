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
}
