import axios, { AxiosError } from 'axios'
import { BASE_URL, GAGU_AUTH_KEY } from '../utils'
import toast from 'react-hot-toast'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  timeoutErrorMessage: 'timeout-error',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
})

instance.interceptors.request.use(config => {
  // const { url, method } = config
  // if (pass) config.url += `&pass=${pass}`
  // if (method === 'post' && url?.includes('?cmd=file')) config.timeout = 0
  const authorization = localStorage.getItem(GAGU_AUTH_KEY) || ''
  config.headers = {
    ...config.headers,
    'Authorization': authorization,
  }
  return config
})

instance.interceptors.response.use(response => response, (error: AxiosError) => {
  const { message, response } = error
  if (message === 'timeout-error') {
    toast.error('请求超时，请重试')
  }
  if (!response) return
  const { status } = response
  if ([401, 403].includes(status)) {
    window.location.href = '/login'
  } else if (status === 502) {
    toast.error('请求失败')
  }
})

export default instance
