import { AxiosRequestConfig } from 'axios'
import { BASE_URL, QUERY_TOKEN_KEY, UserInfoStore, getEntryPath } from '../utils'
import { IEntry, IResponse, IBaseData } from '../types'
import service from './service'

export class FsApi {
  static queryBaseData = async (config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IBaseData>>(`/api/fs/base-data`, config)
    return data
  }

  static queryEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/list?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static queryFlattenEntryList = async (entryList: IEntry[], config?: AxiosRequestConfig) => {
    const { data } = await service.post(`/api/fs/list/flatten`, { entryList }, config)
    return data
  }

  static queryDirectorySize = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/size?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static queryTextContent = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/text?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static queryExists = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/exists?path=${encodeURIComponent(path)}`, config)
    return data
  }

  // TODO: name limit
  static updateEntryName = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await service.put(`/api/fs/rename`, { oldPath, newPath }, config)
    return data
  }

  // TODO: add api
  static updateEntryPath = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await service.put(`/api/fs/rename`, { oldPath, newPath }, config)
    return data
  }

  static createDirectory = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.post(`/api/fs/mkdir`, { path }, config)
    return data
  }

  static deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.delete(`/api/fs/delete?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static uploadFile = async (path: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post(`/api/fs/upload?path=${encodeURIComponent(path)}`, formData, { ...config, timeout: 0 })
    return data
  }

  static uploadImage = async (name: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post(`/api/fs/upload/image/${name}`, formData, { ...config, timeout: 0 })
    return data
  }

  static queryExif = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/exif?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static queryAudioTags = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get(`/api/fs/audio-tags?path=${encodeURIComponent(path)}`, config)
    return data
  }

  static createFavorite = async (path: string) => {
    const { data } = await service.post(`/api/fs/favorite?path=${encodeURIComponent(path)}`)
    return data
  }

  static removeFavorite = async (path: string) => {
    const { data } = await service.delete(`/api/fs/favorite?path=${encodeURIComponent(path)}`)
    return data
  }

  static getEntryStreamUrl = (entry: IEntry) => {
    return `${BASE_URL}/api/fs/stream?path=${encodeURIComponent(getEntryPath(entry))}&${QUERY_TOKEN_KEY}=${UserInfoStore.getToken()}`
  }

  static getThumbnailUrl = (entry: IEntry) => {
    if (entry.extension === 'svg') {
      return this.getEntryStreamUrl(entry)
    }
    return `${BASE_URL}/api/fs/thumbnail?path=${encodeURIComponent(getEntryPath(entry))}&${QUERY_TOKEN_KEY}=${UserInfoStore.getToken()}`
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
