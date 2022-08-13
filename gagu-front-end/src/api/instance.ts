import axios, { AxiosError } from 'axios'
import Toast from '../components/EasyToast'
import { BASE_URL, GAGU_AUTH_CODE_KEY } from '../utils/constant'

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
  // const { url, method } = config
  // if (pass) config.url += `&pass=${pass}`
  // if (method === 'post' && url?.includes('?cmd=file')) config.timeout = 0
  const gaguAuthCode = localStorage.getItem(GAGU_AUTH_CODE_KEY) || ''
  config.headers = {
    ...config.headers,
    'Authorization': gaguAuthCode,
  }
  return config
})

instance.interceptors.response.use(response => response, (error: AxiosError) => {
  const { message, response } = error
  if (message === 'timeout-error') {
    Toast.toast('请求超时，请重试')
  }
  if (!response) return
  const { status } = response
  if ([401, 403].includes(status)) {
    window.location.href = '/login'
    // window.history.replaceState(null, '', '/login')
    // window.location.reload()
  } else if (status === 502) {
    Toast.toast('请求失败')
  }
})

export default instance
