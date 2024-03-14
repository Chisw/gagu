import { IUserInfo, IResponse, IAuthRecord } from '../types'
import service from './service'

export class AuthApi {
  static login = async (formData: { username: string, password: string }) => {
    const { data } = await service.post<IResponse<IUserInfo>>('/api/auth/token', formData)
    return data
  }

  static logout = async () => {
    const { data } = await service.delete<IResponse>('/api/auth/token')
    return data
  }

  static queryRecordList = async () => {
    const { data } = await service.get<IResponse<IAuthRecord[]>>('/api/auth/record')
    return data
  }

  static deleteRecord = async (token: string) => {
    const { data } = await service.delete<IResponse>(`/api/auth/record?token=${token}`)
    return data
  }

  static updateAccessToken = async () => {
    const { data } = await service.put<IResponse<string>>('/api/auth/access-token')
    return data
  }
}
