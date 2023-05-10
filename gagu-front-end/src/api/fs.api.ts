import { AxiosRequestConfig } from 'axios'
import { BASE_URL, UserInfoStore } from '../utils'
import { IEntry } from '../types'
import instance from './instance'

export class FsApi {
  static getRootInfo = async (config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/root`, config)
    return data
  }

  static getEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/list?path=${path}`, config)
    return data
  }

  static getFlattenEntryList = async (entryList: IEntry[], config?: AxiosRequestConfig) => {
    const { data } = await instance.post(`/api/fs/list/flatten`, { entryList }, config)
    return data
  }

  static getDirectorySize = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/size?path=${path}`, config)
    return data
  }

  static getTextContent = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/text?path=${path}`, config)
    return data
  }

  static getExists = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/exists?path=${path}`, config)
    return data
  }

  static renameEntry = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.put(`/api/fs/rename`, { oldPath, newPath }, config)
    return data
  }

  static addDirectory = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.post(`/api/fs/mkdir`, { path }, config)
    return data
  }

  static deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.delete(`/api/fs/delete?path=${path}`, config)
    return data
  }

  static uploadFile = async (path: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await instance.post(`/api/fs/upload?path=${path}`, formData, { ...config, timeout: 0 })
    return data
  }

  static uploadBackground = async (name: string, file: File, config?: AxiosRequestConfig) => {
    let formData = new FormData()
    formData.append('file', file)
    const { data } = await instance.post(`/api/fs/upload/background/${name}`, formData, { ...config, timeout: 0 })
    return data
  }

  static getExif = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/exif?path=${path}`, config)
    return data
  }

  static getTags = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/tags?path=${path}`, config)
    return data
  }

  static getFileStreamUrl = (entry: IEntry) => {
    const { name, parentPath } = entry
    const path = `${parentPath}/${name}`
    return `${BASE_URL}/api/fs/stream?path=${path}&token=${UserInfoStore.getToken()}`
  }

  static getThumbnailUrl = (entry: IEntry) => {
    if (entry.extension === 'svg') {
      return this.getFileStreamUrl(entry)
    }
    const { name, parentPath } = entry
    const path = `${parentPath}/${name}`
    return `${BASE_URL}/api/fs/thumbnail?path=${path}&token=${UserInfoStore.getToken()}`
  }

  static getAvatarStreamUrl = (username: string) => {
    if (!username) return ''
    return `${BASE_URL}/api/fs/avatar/${username}`
  }

  static getBackgroundStreamUrl = (name: string) => {
    if (!name) return ''
    return `${BASE_URL}/api/fs/background/${name}`
  }
}
