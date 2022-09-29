import instance from './instance'

export class AuthApi {
  static login = async (formData: { username: string, password: string }) => {
    const { data } = await instance.post('/api/auth/login', formData)
    return data
  }

  static logout = async () => {
    const { data } = await instance.post('/api/auth/logout')
    return data
  }

  static getAuthData = async () => {
    const { data } = await instance.get('/api/auth')
    return data
  }

  static addUser = async (formData: any) => {
    const { data } = await instance.post('/api/auth/user', formData)
    return data
  }

  static removeUser = async (username: string) => {
    const { data } = await instance.delete(`/api/auth/user/${username}`)
    return data
  }

  static shutdown = async () => {
    const { data } = await instance.post('/api/auth/shutdown')
    return data
  }
}
