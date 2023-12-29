import { IUserInfo, IResponse } from '../types'
import service from './service'

export class AuthApi {
  static login = async (formData: { username: string, password: string }) => {
    const { data } = await service.post<IResponse<IUserInfo>>('/api/auth/login', formData)
    return data
  }

  static logout = async () => {
    const { data } = await service.post<IResponse>('/api/auth/logout')
    return data
  }

  static shutdown = async () => {
    const { data } = await service.post<IResponse>('/api/auth/shutdown')
    return data
  }
}
