import { IResponse, IUser, IUserForm, User, UserValidityType } from '../types'
import service from './service'

export class UserApi {

  static queryUserList = async () => {
    const { data } = await service.get<IResponse<{ userList: IUser[], loggedInList: User.Username[] }>>('/api/user')
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

  static updateUserValidity = async (username: string, validity: UserValidityType) => {
    const { data } = await service.patch<IResponse>(`/api/user/${username}/validity/${validity}`)
    return data
  }
}
