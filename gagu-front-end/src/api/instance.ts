import axios, { AxiosError } from 'axios'
import Toast from '../components/EasyToast'
import { BASE_URL, GAGU_AUTH_CODE_KEY } from '../utils/constant'

const gaguAuthCode = localStorage.getItem(GAGU_AUTH_CODE_KEY) || ''

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  timeoutErrorMessage: 'timeout-error',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'gagu-auth-code': gaguAuthCode,
  },
})

// interceptors
instance.interceptors.request.use(config => {
  // const { url, method } = config
  // if (pass) config.url += `&pass=${pass}`
  // if (method === 'post' && url?.includes('?cmd=file')) config.timeout = 0
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
    window.history.replaceState(null, '', '/login')
    window.location.reload()
  } else if (status === 502) {
    Toast.toast('请求失败')
  }
})

export default instance
