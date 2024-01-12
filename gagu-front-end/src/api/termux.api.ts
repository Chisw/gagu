import service from './service'
import { IResponse } from '../types'
import {
  BrightnessType,
  IBatteryStatus,
  ICameraInfo,
  IContact,
  IDialogForm,
  IDownloadForm,
  IInfraredFrequency,
  IInfraredTransmit,
} from '../types/termux.type'

export class TermuxApi {
  static queryBatteryStatus = async () => {
    const { data } = await service.get<IResponse<IBatteryStatus>>('/api/termux/battery-status')
    return data
  }

  static updateBrightness = async (formData: { brightness: BrightnessType }) => {
    const { data } = await service.post<IResponse>('/api/termux/brightness', formData)
    return data
  }

  static queryCallLog = async () => {
    const { data } = await service.get<IResponse>('/api/termux/call-log')
    return data
  }

  static queryCameraInfo = async () => {
    const { data } = await service.get<IResponse<ICameraInfo[]>>('/api/termux/camera-info')
    return data
  }

  static createCameraPhoto = async (cameraId: string) => {
    const { data } = await service.post<IResponse<{ path: string }>>(`/api/termux/camera-photo/${cameraId}`)
    return data
  }

  static queryClipboard = async () => {
    const { data } = await service.get<IResponse<{ value: string }>>('/api/termux/clipboard')
    return data
  }

  static updateClipboard = async (formData: { value: string }) => {
    const { data } = await service.put<IResponse>('/api/termux/clipboard', formData)
    return data
  }

  static queryContactList = async () => {
    const { data } = await service.get<IResponse<IContact[]>>('/api/termux/contact-list')
    return data
  }

  static createDialog = async (formData: IDialogForm) => {
    const { data } = await service.post<IResponse>('/api/termux/dialog', formData)
    return data
  }

  static createDownload = async (formData: IDownloadForm) => {
    const { data } = await service.post<IResponse>('/api/termux/download', formData)
    return data
  }

  static queryFingerprint = async () => {
    const { data } = await service.get<IResponse>('/api/termux/fingerprint')
    return data
  }

  static queryInfraredFrequencies = async () => {
    const { data } = await service.get<IResponse<IInfraredFrequency[]>>('/api/termux/infrared-frequencies')
    return data
  }

  static createInfraredTransmit = async (formData: IInfraredTransmit) => {
    const { data } = await service.post<IResponse>('/api/termux/infrared-transmit', formData, { timeout: 0 })
    return data
  }
}
