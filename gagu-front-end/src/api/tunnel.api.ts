import { IEntry, IResponse, ITunnel, TunnelForm } from '../types'
import { BASE_URL, getPasswordParam } from '../utils'
import service from './service'

export class TunnelApi {
  static queryTunnelList = async () => {
    const { data } = await service.get<IResponse<ITunnel[]>>(`/api/tunnel`)
    return data
  }

  static createTunnel = async (formData: TunnelForm) => {
    const { data } = await service.post<IResponse<string>>('/api/tunnel', formData)
    return data
  }

  static queryTunnel = async (code: string, password?: string) => {
    const { data } = await service.get<IResponse<{ tunnel: ITunnel, flatList: IEntry[] }>>(`/api/tunnel/${code}?${getPasswordParam(password)}`)
    return data
  }

  static deleteTunnel = async (code: string) => {
    const { data } = await service.delete<IResponse>(`/api/tunnel/${code}`)
    return data
  }

  static queryTunnelCheck = async (code: string, password?: string) => {
    const { data } = await service.get<IResponse>(`/api/tunnel/${code}/check?${getPasswordParam(password)}`)
    return data
  }

  static getDownloadUrl = (code: string, password?: string) => {
    return `${BASE_URL}/api/tunnel/${code}/download?${getPasswordParam(password)}`
  }

  static download = (code: string, password?: string) => {
    const url = this.getDownloadUrl(code, password)
    window.open(url, '_self')
  }
}
