import { IUserForm } from '../types'
import instance from './instance'

export class UserApi {

  static getData = async () => {
    const { data } = await instance.get('/api/user')
    return data
  }

  static addUser = async (formData: IUserForm) => {
    const { data } = await instance.post('/api/user', formData)
    return data
  }

  static removeUser = async (username: string) => {
    const { data } = await instance.delete(`/api/user/${username}`)
    return data
  }
}
