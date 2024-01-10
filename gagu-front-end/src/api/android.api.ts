import { IResponse } from '../types'
import { IBatteryStatus } from '../types/android.type'
import service from './service'

export class AndroidApi {
  static queryBatteryStatus = async () => {
    const { data } = await service.get<IResponse<IBatteryStatus>>('/api/android/battery-status')
    return data
  }
}
