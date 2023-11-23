import { IUserForm, UserValidityType } from '../types'
import service from './service'

export class UserApi {

  static queryUser = async () => {
    const { data } = await service.get('/api/user')
    return data
  }

  static createUser = async (formData: IUserForm) => {
    const { data } = await service.post('/api/user', formData)
    return data
  }

  static updateUser = async (formData: IUserForm) => {
    const { data } = await service.patch('/api/user', formData)
    return data
  }

  static deleteUser = async (username: string) => {
    const { data } = await service.delete(`/api/user/${username}`)
    return data
  }

  static updateUserValidity = async (username: string, validity: UserValidityType) => {
    const { data } = await service.patch(`/api/user/${username}/validity/${validity}`)
    return data
  }
}
