import { IUserForm, UserAbilityType } from '../types'
import service from './service'

export class UserApi {

  static getUserData = async () => {
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

  static updateUserAbility = async (username: string, ability: UserAbilityType) => {
    const { data } = await service.post(`/api/user/${username}/${ability}`)
    return data
  }
}
