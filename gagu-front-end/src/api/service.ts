import axios from 'axios'
import { BASE_URL, ERROR_TIMEOUT, HEADERS_AUTH_KEY, HEADERS_AUTH_PREFIX, UserInfoStore } from '../utils'
import toast from 'react-hot-toast'
import { t } from 'i18next'
import { ServerMessage } from '../types'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 30 * 1000,
  timeoutErrorMessage: ERROR_TIMEOUT,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
})

service.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    [HEADERS_AUTH_KEY]: `${HEADERS_AUTH_PREFIX}${UserInfoStore.getToken()}`,
  }
  return config
})

service.interceptors.response.use(
  (response: any) => {
    const { success, message } = response?.data || {}
    if (!success) {
      toast.error(t(`server.${message}`))
    }
    return response
  },
  (error: any) => {
    const { message, response } = error
    if (message === ERROR_TIMEOUT) {
      toast.error(message)
    }

    if (!response && message !== 'canceled') {
      toast.error(t(`server.${ServerMessage.ERROR_NO_RESPONSE}`))
      return
    }

    const { status } = response

    if (status === 401) {
      UserInfoStore.remove()
      window.location.href = '/login'
    } else if (status === 403) {
      toast.error(t(`server.${ServerMessage.ERROR_403}`))
    } else if (status >= 500) {
      toast.error(`[ERROR ${status}] ${message}`)
    }
  }
)

export default service
