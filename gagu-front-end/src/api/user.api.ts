import { IResponse, IUser, IUserForm, UserPasswordForm, UserValidityType } from '../types'
import { UserInfoStore } from '../utils'
import service from './service'

export class UserApi {

  static queryUserList = async () => {
    const { data } = await service.get<IResponse<IUser[]>>('/api/user')
    return data
  }

  static createUser = async (formData: IUserForm) => {
    const { data } = await service.post<IResponse>('/api/user', formData)
    return data
  }

  static updateUser = async (formData: IUserForm) => {
    const { data } = await service.patch<IResponse>('/api/user', formData)
    return data
  }

  static deleteUser = async (username: string) => {
    const { data } = await service.delete<IResponse>(`/api/user/${username}`)
    return data
  }

  static updateUserPassword = async (formData: UserPasswordForm) => {
    const username = UserInfoStore.getUsername()
    const { data } = await service.put<IResponse>(`/api/user/${username}/password`, formData)
    return data
  }

  static updateUserValidity = async (username: string, validity: UserValidityType) => {
    const { data } = await service.patch<IResponse>(`/api/user/${username}/validity/${validity}`)
    return data
  }
}
