import { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../utils'
import { INestedFile } from '../utils/types'
import instance from './instance'

export class FsApi {
  static getEntryList = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/list?path=${path}`, config)
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

  static uploadFile = async (parentPath: string, nestedFile: INestedFile, config?: AxiosRequestConfig) => {
    const { name, nestedPath } = nestedFile
    let formData = new FormData()
    formData.append('file', nestedFile)
    const { data } = await instance.post(`/api/fs/upload?path=${parentPath}${nestedPath || `/${name}`}`, formData, { ...config, timeout: 0 })
    return data
  }

  static getThumbnailBase64 = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.get(`/api/fs/thumbnail?path=${path}`, config)
    return data
  }

  static getFileStreamUrl = (path: string) => {
    return `${BASE_URL}/api/fs/stream?path=${path}`
  }

  static startDownload = (parentPath: string, downloadName: string, cmd: string) => {
    window.open(`${BASE_URL}/api/fs/download/${downloadName}?path=${parentPath}/${downloadName}${cmd}`, '_self')
  }
}
