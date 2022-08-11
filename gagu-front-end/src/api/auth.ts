import { AxiosRequestConfig } from 'axios'
import instance from './instance'

export class AuthApi {
  static login = async (formData: { username: string, password: string }, config?: AxiosRequestConfig) => {
    const { data } = await instance.post('/api/login', formData, config)
    return data
  }
}
