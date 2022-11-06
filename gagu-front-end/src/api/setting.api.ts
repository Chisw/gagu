import { ISetting } from '../types'
import instance from './instance'

export class SettingApi {
  static getAll = async () => {
    const { data } = await instance.get('/api/setting')
    return data
  }

  static update = async (settings: ISetting) => {
    const { data } = await instance.put('/api/setting', settings)
    return data
  }
}
