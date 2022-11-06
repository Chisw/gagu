import { DownloadTunnelBase } from '../types'
import { BASE_URL } from '../utils'
import instance from './instance'

export class DownloadApi {
  static create = async (downloadTunnelBase: DownloadTunnelBase) => {
    const { data } = await instance.post('/api/download', downloadTunnelBase)
    return data
  }

  static download = (code: string) => {
    window.open(`${BASE_URL}/api/download/${code}`, '_self')
  }
}
