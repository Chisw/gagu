import { IUserForm } from '../types'
import instance from './instance'

export class UserApi {

  static getUserData = async () => {
    const { data } = await instance.get('/api/user')
    return data
  }

  static createUser = async (formData: IUserForm) => {
    const { data } = await instance.post('/api/user', formData)
    return data
  }

  static updateUser = async (username: string, formData: IUserForm) => {
    const { data } = await instance.post(`/api/user/${username}`, formData)
    return data
  }

  static removeUser = async (username: string) => {
    const { data } = await instance.delete(`/api/user/${username}`)
    return data
  }
}
