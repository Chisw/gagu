import { IEntry, IResponse, ITunnel, TunnelForm } from '../types'
import { getPasswordParam } from '../utils'
import service from './service'


export class TunnelApi {
  static queryTunnels = async () => {
    const { data } = await service.get<IResponse<ITunnel[]>>(`/api/tunnel`)
    return data
  }

  static createTunnel = async (tunnelForm: TunnelForm) => {
    const { data } = await service.post<IResponse<string>>('/api/tunnel', tunnelForm)
    return data
  }

  static queryTunnel = async (code: string, password?: string) => {
    const { data } = await service.get<IResponse<{ tunnel: ITunnel, flattenList: IEntry[] }>>(`/api/tunnel/${code}?${getPasswordParam(password)}`)
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
}
