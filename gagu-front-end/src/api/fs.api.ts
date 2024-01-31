import { AxiosRequestConfig } from 'axios'
import { BASE_URL, getEntryPath, getExistingStrategyParam, getPathParam, getAccessTokenParam } from '../utils'
import { IEntry, IResponse, IBaseData, IRootEntry, IExifInfo, IAudioInfo, ExistingStrategyType, TransferResultType } from '../types'
import service from './service'

export class FsApi {
  static queryBaseData = async () => {
    const { data } = await service.get<IResponse<IBaseData>>(`/api/fs/base-data`)
    return data
  }

  static queryEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await service.get<IResponse<IEntry[]>>(`/api/fs/list?${getPathParam(path)}`, config)
    return data
  }

  static queryFlatEntryList = async (entryList: IEntry[]) => {
    const { data } = await service.post<IResponse<IEntry[]>>(`/api/fs/list/flat`, { entryList })
    return data
  }

  static queryExists = async (path: string) => {
    const { data } = await service.get<IResponse<boolean>>(`/api/fs/exists?${getPathParam(path)}`)
    return data
  }

  static queryExistsCount = async (formData: { pathList: string[] }) => {
    const { data } = await service.post<IResponse<number>>(`/api/fs/exists`, formData)
    return data
  }

  static queryDirectorySize = async (path: string) => {
    const { data } = await service.get<IResponse<number>>(`/api/fs/size?${getPathParam(path)}`)
    return data
  }

  static queryTextContent = async (path: string) => {
    const { data } = await service.get<IResponse<string>>(`/api/fs/text?${getPathParam(path)}`)
    return data
  }

  static queryExifInfo = async (path: string) => {
    const { data } = await service.get<IResponse<IExifInfo>>(`/api/fs/exif-info?${getPathParam(path)}`)
    return data
  }

  static queryAudioInfo = async (path: string) => {
    const { data } = await service.get<IResponse<IAudioInfo>>(`/api/fs/audio-info?${getPathParam(path)}`)
    return data
  }

  static createDirectory = async (path: string) => {
    const { data } = await service.post<IResponse<TransferResultType>>(`/api/fs/directory`, { path })
    return data
  }

  static createFile = async (path: string, file: File, strategy?: ExistingStrategyType, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)

    const params = [
      getPathParam(path),
      getExistingStrategyParam(strategy),
    ].filter(Boolean).join('&')

    const { data } = await service.post<IResponse<TransferResultType>>(`/api/fs/file?${params}`, formData, { ...config, timeout: 0 })
    return data
  }

  static renameEntry = async (fromPath: string, toPath: string) => {
    const { data } = await service.patch<IResponse>(`/api/fs/entry`, { fromPath, toPath })
    return data
  }

  static moveEntry = async (fromPath: string, toPath: string, strategy?: ExistingStrategyType) => {
    const { data } = await service.put<IResponse>(`/api/fs/entry?${getExistingStrategyParam(strategy)}`, { fromPath, toPath })
    return data
  }

  static copyEntry = async (fromPath: string, toPath: string, strategy?: ExistingStrategyType) => {
    const { data } = await service.post<IResponse>(`/api/fs/entry?${getExistingStrategyParam(strategy)}`, { fromPath, toPath })
    return data
  }

  static deleteEntry = async (path: string) => {
    const { data } = await service.delete<IResponse>(`/api/fs/entry?${getPathParam(path)}`)
    return data
  }

  static createFavorite = async (path: string) => {
    const { data } = await service.post<IResponse<IRootEntry[]>>(`/api/fs/favorite?${getPathParam(path)}`)
    return data
  }

  static removeFavorite = async (path: string) => {
    const { data } = await service.delete<IResponse<IRootEntry[]>>(`/api/fs/favorite?${getPathParam(path)}`)
    return data
  }

  static createPublicImage = async (name: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await service.post<IResponse>(`/api/fs/public/image/${name}`, formData, { ...config, timeout: 0 })
    return data
  }

  static getThumbnailStreamUrl = (entry: IEntry) => {
    if (entry.extension === 'svg') {
      return this.getEntryStreamUrl(entry)
    }
    return `${BASE_URL}/api/fs/thumbnail?${getPathParam(getEntryPath(entry))}&${getAccessTokenParam()}`
  }

  static getPathStreamUrl = (path: string) => {
    return `${BASE_URL}/api/fs/stream?${getPathParam(path)}&${getAccessTokenParam()}`
  }

  static getEntryStreamUrl = (entry: IEntry) => {
    return this.getPathStreamUrl(getEntryPath(entry))
  }

  static getPublicAvatarStreamUrl = (username: string) => {
    if (!username) return ''
    return `${BASE_URL}/api/fs/public/avatar/${username}`
  }

  static getPublicImageStreamUrl = (name: string) => {
    if (!name) return ''
    return `${BASE_URL}/api/fs/public/image/${name}`
  }
}
