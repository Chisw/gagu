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

  static shutdown = async () => {
    const { data } = await instance.post('/api/auth/shutdown')
    return data
  }
}
