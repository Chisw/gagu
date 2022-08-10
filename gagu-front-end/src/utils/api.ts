import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { INestedFile } from './types'
import getPass from './pass'
import Toast from '../components/EasyToast'

const { protocol, host } = window.location
const PASS_KEY = 'PASS_KEY'
const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  timeoutErrorMessage: 'timeout-error',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
})

// interceptors
instance.interceptors.request.use(config => {
  const { url, method } = config
  // const pass = localStorage.getItem(PASS_KEY)
  // if (pass) config.url += `&pass=${pass}`
  if (method === 'post' && url?.includes('?cmd=file')) config.timeout = 0
  return config
})

instance.interceptors.response.use(response => response, (error: AxiosError) => {
  const { message, response } = error
  if (message === 'timeout-error') {
    Toast.toast('请求超时，请重试')
  }
  if (!response) return
  const { status } = response
  if (status === 401) {
    const password = window.prompt('请输入访问密码？')
    if (password) {
      const pass = getPass(password)
      localStorage.setItem(PASS_KEY, pass)
    }
  } else if (status === 502) {
    Toast.toast('请求失败')
  }
})


export const getEntryList = async (path: string, config?: AxiosRequestConfig) => {
  const { data } = await instance.get(`/api/list?path=${path}`, config)
  return data
}

export const getDirectorySize = async (path: string, config?: AxiosRequestConfig) => {
  const { data } = await instance.get(`/api/size?path=${path}`, config)
  return data
}

export const deleteEntry = async (path: string, config?: AxiosRequestConfig) => {
  const { data } = await instance.delete(`/api/delete?path=${path}`, config)
  return data
}

export const getExists = async (path: string, config?: AxiosRequestConfig) => {
  const { data } = await instance.get(`/api/exists?path=${path}`, config)
  return data
}

export const renameEntry = async (oldPath: string, newPath: string, config?: AxiosRequestConfig) => {
  const formData = { oldPath, newPath }
  const { data } = await instance.put(`/api/rename`, formData, config)
  return data
}

export const addDirectory = async (path: string, config?: AxiosRequestConfig) => {
  const formData = { path }
  const { data } = await instance.post(`/api/addDirectory`, formData, config)
  return data
}

export const getTextContent = async (path: string, config?: AxiosRequestConfig) => {
  const { data } = await instance.get(`/api/textContent?path=${path}`, config)
  return data
}






export const uploadFile = async (parentPath: string, nestedFile: INestedFile, config?: AxiosRequestConfig) => {
  const { name, size, lastModified, nestedPath } = nestedFile
  const targetFileName = nestedPath || `/${name}`
  const url = `${parentPath}${targetFileName}?cmd=file&size=${size}&file_date=${lastModified}`
  const { data } = await instance.post(url, nestedFile, config)
  return data
}



// 
export const downloadEntries = (parentPath: string, downloadName: string, cmd: string) => {
  window.open(`${BASE_URL}${parentPath}/${downloadName}?${cmd}`, '_self')
}

export const getThumbnailUrl = (path: string) => {
  return `${BASE_URL}${path}?cmd=thumbnail`
}

export const getBinFileUrl = (path: string) => {
  return `${BASE_URL}${path}?cmd=file`
}
