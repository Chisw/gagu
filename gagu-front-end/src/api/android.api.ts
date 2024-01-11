import service from './service'
import { IResponse } from '../types'
import {
  BrightnessType,
  IBatteryStatus,
  ICameraInfo,
} from '../types/android.type'

export class AndroidApi {
  static queryBatteryStatus = async () => {
    const { data } = await service.get<IResponse<IBatteryStatus>>('/api/android/battery-status')
    return data
  }

  static updateBrightness = async (formData: { brightness: BrightnessType }) => {
    const { data } = await service.post<IResponse>('/api/android/brightness', formData)
    return data
  }

  static queryCallLog = async () => {
    const { data } = await service.get<IResponse>('/api/android/call-log')
    return data
  }

  static queryCameraInfo = async () => {
    const { data } = await service.get<IResponse<ICameraInfo[]>>('/api/android/camera-info')
    return data
  }

  static createCameraPhoto = async (cameraId: string) => {
    const { data } = await service.post<IResponse<{ path: string }>>(`/api/android/camera-photo/${cameraId}`)
    return data
  }
}
