import { IResponse, ISetting, IVersion } from '../types'
import service from './service'

export class SettingApi {
  static querySettings = async () => {
    const { data } = await service.get<IResponse<ISetting>>('/api/setting')
    return data
  }

  static updateSetting = async (settings: ISetting) => {
    const { data } = await service.put<IResponse<ISetting>>('/api/setting', settings)
    return data
  }

  static queryLatestVersion = async () => {
    const { data } = await service.get<IResponse<IVersion>>('/api/setting/version')
    return data
  }

  static updateVersion = async () => {
    const { data } = await service.put<IResponse>('/api/setting/version', undefined, { timeout: 0 })
    return data
  }

  static shutdown = async () => {
    const { data } = await service.put<IResponse>('/api/setting/shutdown')
    return data
  }
}
