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
  IInfraredTransmitForm,
  ILocation,
  ILocationForm,
  ISMS,
  MediaPlayerStateType,
} from '../types/termux.type'
import { getPathParam } from '../utils'

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

  static createInfraredTransmit = async (formData: IInfraredTransmitForm) => {
    const { data } = await service.post<IResponse>('/api/termux/infrared-transmit', formData, { timeout: 0 })
    return data
  }

  static queryLocation = async (params: ILocationForm) => {
    const { data } = await service.get<IResponse<ILocation>>('/api/termux/location', { params })
    return data
  }

  static queryMediaPlayerInfo = async () => {
    const { data } = await service.get<IResponse>('/api/termux/media-player')
    return data
  }

  static createMediaPlayerPlay = async (path: string) => {
    const { data } = await service.post<IResponse>(`/api/termux/media-player?${getPathParam(path)}`)
    return data
  }

  static updateMediaPlayerState = async (state: MediaPlayerStateType) => {
    const { data } = await service.put<IResponse>(`/api/termux/media-player/${state}`)
    return data
  }

  static querySMSList = async () => {
    const { data } = await service.get<IResponse<ISMS[]>>('/api/termux/sms-list')
    return data
  }
}
