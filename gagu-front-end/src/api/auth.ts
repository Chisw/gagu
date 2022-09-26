import { AxiosRequestConfig } from 'axios'
import instance from './instance'

export class AuthApi {
  static login = async (formData: { username: string, password: string }, config?: AxiosRequestConfig) => {
    const { data } = await instance.post('/api/auth/login', formData, config)
    return data
  }

  static getUserList = async () => {
    const { data } = await instance.get('/api/auth/users')
    return data
  }

  static shutdown = async () => {
    const { data } = await instance.post('/api/auth/shutdown')
    return data
  }
}
