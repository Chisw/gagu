import md5 from 'md5'
import { DownloadTunnelForm, IDownloadTunnel, IEntry, ResponseBase } from '../types'
import { BASE_URL } from '../utils'
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

  static getTunnel = async (code: string) => {
    const { data } = await instance.get<TunnelResponse>(`/api/download/${code}/share`)
    return data
  }

  static checkTunnel = async (code: string, password?: string) => {
    const { data } = await instance.get<ResponseBase>(`/api/download/${code}/call/${md5(password || '')}`)
    return data
  }

  static download = (code: string) => {
    window.open(`${BASE_URL}/api/download/${code}`, '_self')
  }
}
