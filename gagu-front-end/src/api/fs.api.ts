import { AxiosRequestConfig } from 'axios'
import { BASE_URL, QUERY_TOKEN_KEY, UserInfoStore, getEntryPath, getPathParam } from '../utils'
import { IEntry, IResponse, IBaseData, ISideEntry, IExif, IAudioTag } from '../types'
import service from './service'

export class FsApi {
  static queryBaseData = async (config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IBaseData>>(`/api/fs/base-data`, config)
    return data
  }

  static queryEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IEntry[]>>(`/api/fs/list?${getPathParam(path)}`, config)
    return data
  }

  static queryFlattenEntryList = async (entryList: IEntry[], config?: AxiosRequestConfig) => {
    const { data } = await service.post<IResponse<IEntry[]>>(`/api/fs/list/flatten`, { entryList }, config)
    return data
  }

  static queryDirectorySize = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<number>>(`/api/fs/size?${getPathParam(path)}`, config)
    return data
  }

  static queryTextContent = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<string>>(`/api/fs/text?${getPathParam(path)}`, config)
    return data
  }

  static queryExists = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<boolean>>(`/api/fs/exists?${getPathParam(path)}`, config)
    return data
  }

  // TODO: name limit
  static updateEntryName = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await service.put<IResponse>(`/api/fs/rename`, { oldPath, newPath }, config)
    return data
  }

  static updateEntryPath = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await service.put<IResponse>(`/api/fs/move`, { oldPath, newPath }, config)
    return data
  }

  static createDirectory = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.post<IResponse>(`/api/fs/mkdir`, { path }, config)
    return data
  }

  static deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.delete<IResponse>(`/api/fs/delete?${getPathParam(path)}`, config)
    return data
  }

  static uploadFile = async (path: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post<IResponse>(`/api/fs/upload?${getPathParam(path)}`, formData, { ...config, timeout: 0 })
    return data
  }

  static uploadImage = async (name: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post<IResponse>(`/api/fs/upload/image/${name}`, formData, { ...config, timeout: 0 })
    return data
  }

  static queryExif = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IExif>>(`/api/fs/exif?${getPathParam(path)}`, config)
    return data
  }

  static queryAudioTags = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IAudioTag>>(`/api/fs/audio-tags?${getPathParam(path)}`, config)
    return data
  }

  static createFavorite = async (path: string) => {
    const { data } = await service.post<IResponse<ISideEntry[]>>(`/api/fs/favorite?${getPathParam(path)}`)
    return data
  }

  static removeFavorite = async (path: string) => {
    const { data } = await service.delete<IResponse<ISideEntry[]>>(`/api/fs/favorite?${getPathParam(path)}`)
    return data
  }

  static getEntryStreamUrl = (entry: IEntry) => {
    return `${BASE_URL}/api/fs/stream?${getPathParam(getEntryPath(entry))}&${QUERY_TOKEN_KEY}=${UserInfoStore.getToken()}`
  }

  static getThumbnailStreamUrl = (entry: IEntry) => {
    if (entry.extension === 'svg') {
      return this.getEntryStreamUrl(entry)
    }
    return `${BASE_URL}/api/fs/thumbnail?${getPathParam(getEntryPath(entry))}&${QUERY_TOKEN_KEY}=${UserInfoStore.getToken()}`
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
