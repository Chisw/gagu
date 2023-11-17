import { IUserForm, UserValidityType } from '../types'
import { UserInfoStore } from '../utils'
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

  static removeUser = async (username: string) => {
    const { data } = await service.delete(`/api/user/${username}`)
    return data
  }

  static updateUserValidity = async (username: string, validity: UserValidityType) => {
    const { data } = await service.patch(`/api/user/${username}/validity/${validity}`)
    return data
  }

  static queryUserFavorite = async () => {
    const username = UserInfoStore.getUsername()
    const { data } = await service.get(`/api/user/${username}/favorite`)
    return data
  }

  static createUserFavorite = async (path: string) => {
    const username = UserInfoStore.getUsername()
    const { data } = await service.post(`/api/user/${username}/favorite?path=${encodeURIComponent(path)}`)
    return data
  }

  static removeUserFavorite = async (path: string) => {
    const username = UserInfoStore.getUsername()
    const { data } = await service.delete(`/api/user/${username}/favorite?path=${encodeURIComponent(path)}`)
    return data
  }
}
