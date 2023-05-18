import { AxiosRequestConfig } from 'axios'
import { BASE_URL, UserInfoStore, getEntryPath } from '../utils'
import { IEntry, IResponse, IRootInfo } from '../types'
import service from './service'

export class FsApi {
  static queryRootInfo = async (config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IRootInfo>>(`/api/fs/root`, config)
    return data
  }

  static queryEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/list?path=${path}`, config)
    return data
  }

  static getFlattenEntryList = async (entryList: IEntry[], config?: AxiosRequestConfig) => {
    const { data } = await service.post(`/api/fs/list/flatten`, { entryList }, config)
    return data
  }

  static queryDirectorySize = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/size?path=${path}`, config)
    return data
  }

  static getTextContent = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/text?path=${path}`, config)
    return data
  }

  static getExists = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/exists?path=${path}`, config)
    return data
  }

  static renameEntry = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await service.put(`/api/fs/rename`, { oldPath, newPath }, config)
    return data
  }

  static addDirectory = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.post(`/api/fs/mkdir`, { path }, config)
    return data
  }

  static deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.delete(`/api/fs/delete?path=${path}`, config)
    return data
  }

  static uploadFile = async (path: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post(`/api/fs/upload?path=${path}`, formData, { ...config, timeout: 0 })
    return data
  }

  static uploadImage = async (name: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post(`/api/fs/upload/image/${name}`, formData, { ...config, timeout: 0 })
    return data
  }

  static getExif = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/exif?path=${path}`, config)
    return data
  }

  static queryAudioTags = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/audio-tags?path=${path}`, config)
    return data
  }

  static getFileStreamUrl = (entry: IEntry) => {
    return `${BASE_URL}/api/fs/stream?path=${getEntryPath(entry)}&token=${UserInfoStore.getToken()}`
  }

  static getThumbnailUrl = (entry: IEntry) => {
    if (entry.extension === 'svg') {
      return this.getFileStreamUrl(entry)
    }
    return `${BASE_URL}/api/fs/thumbnail?path=${getEntryPath(entry)}&token=${UserInfoStore.getToken()}`
  }

  static getAvatarStreamUrl = (username: string) => {
    if (!username) return ''
    return `${BASE_URL}/api/fs/avatar/${username}`
  }

  static getImageStreamUrl = (name: string) => {
    if (!name) return ''
    return `${BASE_URL}/api/fs/image/${name}`
  }
}
