import axios from 'axios'
import { BASE_URL, ERROR_TIMEOUT, UserInfoStore } from '../utils'
import { Toast } from '@douyinfe/semi-ui'
import { t } from 'i18next'
import { ServerMessage, HEADERS_AUTH_KEY, HEADERS_AUTH_PREFIX } from '@shared'

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
      Toast.error(t(`server.${message}`) as string)
    }
    return response
  },
  (error: any) => {
    const { message, response } = error
    if (message === ERROR_TIMEOUT) {
      Toast.error(message)
    }

    if (!response && message !== 'canceled') {
      Toast.error(t(`server.${ServerMessage.ERROR_NO_RESPONSE}`) as string)
      return
    }

    const { status } = response

    if (status === 401) {
      UserInfoStore.remove()
      window.location.href = '/login'
    } else if (status === 403) {
      Toast.error(t(`server.${ServerMessage.ERROR_403}`) as string)
    } else if (status >= 500) {
      Toast.error(`[ERROR ${status}] ${message}`)
    }
  }
)

export default service
