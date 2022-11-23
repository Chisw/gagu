import { DownloadTunnelForm, IDownloadTunnel, IEntry, ResponseBase } from '../types'
import { BASE_URL, getPasswordParam } from '../utils'
import instance from './instance'

interface CreateResponse extends ResponseBase {
  code?: string
}

interface TunnelResponse extends ResponseBase {
  flattenList?: IEntry[]
  tunnel?: IDownloadTunnel
}

export class DownloadApi {
  static create = async (downloadTunnelForm: DownloadTunnelForm) => {
    const { data } = await instance.post<CreateResponse>('/api/download', downloadTunnelForm)
    return data
  }

  static getTunnelInfo = async (code: string, password?: string) => {
    const { data } = await instance.get<TunnelResponse>(`/api/download/${code}/info${getPasswordParam(password)}`)
    return data
  }

  static checkTunnel = async (code: string, password?: string) => {
    const { data } = await instance.get<ResponseBase>(`/api/download/${code}/check${getPasswordParam(password)}`)
    return data
  }

  static download = (code: string, password?: string) => {
    window.open(`${BASE_URL}/api/download/${code}${getPasswordParam(password)}`, '_self')
  }

  static getTunnels = async (username?: string) => {
    const { data } = await instance.get(`/api/download/tunnels${username ? `/${username}` : ''}`)
    return data
  }
}
