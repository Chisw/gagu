import axios, { AxiosError } from 'axios'
import { BASE_URL, ERROR_TIMEOUT, TOKEN } from '../utils'
import toast from 'react-hot-toast'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  timeoutErrorMessage: ERROR_TIMEOUT,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
})

instance.interceptors.request.use(config => {
  // const { url, method } = config
  // if (method === 'post' && url?.includes('?cmd=file')) config.timeout = 0
  config.headers = {
    ...config.headers,
    'Authorization': TOKEN.get(),
  }
  return config
})

instance.interceptors.response.use(response => response, (error: AxiosError) => {
  const { message, response } = error
  if (message === ERROR_TIMEOUT) {
    toast.error(message)
  }
  if (!response) return
  const { status } = response
  if (status === 401) {
    window.location.href = '/login'
  } else if (status === 403) {
    toast.error('ERROR_403')
  } else if (status >= 500) {
    toast.error(`ERROR_${status}: ${message}`)
  }
})

export default instance
