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
    const formData = { oldPath, newPath }
    const { data } = await instance.put(`/api/fs/rename`, formData, config)
    return data
  }

  static addDirectory = async (path: string, config?: AxiosRequestConfig) => {
    const formData = { path }
    const { data } = await instance.post(`/api/fs/mkdir`, formData, config)
    return data
  }

  static deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
    const { data } = await instance.delete(`/api/fs/delete?path=${path}`, config)
    return data
  }

  static getThumbnailUrl = (path: string) => {
    return `${BASE_URL}/api/fs/thumbnail?path=${path}`
  }

  static getFileStreamUrl = (path: string) => {
    return `${BASE_URL}/api/fs/stream?path=${path}`
  }

  static downloadEntries = (parentPath: string, downloadName: string, cmd: string) => {
    window.open(`${BASE_URL}${parentPath}/${downloadName}?${cmd}`, '_self')
  }

  static uploadFile = async (parentPath: string, nestedFile: INestedFile, config?: AxiosRequestConfig) => {
    const { name, size, lastModified, nestedPath } = nestedFile
    const targetFileName = nestedPath || `/${name}`
    const url = `${parentPath}${targetFileName}?cmd=file&size=${size}&file_date=${lastModified}`
    const { data } = await instance.post(url, nestedFile, config)
    return data
  }
}
