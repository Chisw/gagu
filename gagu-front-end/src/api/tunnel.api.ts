import { TunnelForm, ITunnel, IEntry, ResponseBase } from '../types'
import { getPasswordParam } from '../utils'
import service from './service'

interface CreateResponse extends ResponseBase {
  code?: string
}

interface TunnelResponse extends ResponseBase {
  flattenList?: IEntry[]
  tunnel?: ITunnel
}

export class TunnelApi {
  static getTunnels = async () => {
    const { data } = await service.get(`/api/tunnel`)
    return data
  }

  static createTunnel = async (tunnelForm: TunnelForm) => {
    const { data } = await service.post<CreateResponse>('/api/tunnel', tunnelForm)
    return data
  }

  static getTunnel = async (code: string, password?: string) => {
    const { data } = await service.get<TunnelResponse>(`/api/tunnel/${code}${getPasswordParam(password)}`)
    return data
  }

  static deleteTunnel = async (code: string) => {
    const { data } = await service.delete(`/api/tunnel/${code}`)
    return data
  }

  static checkTunnel = async (code: string, password?: string) => {
    const { data } = await service.get<ResponseBase>(`/api/tunnel/${code}/check${getPasswordParam(password)}`)
    return data
  }
}
