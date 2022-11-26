import { BASE_URL, getPasswordParam } from '../utils'

export class DownloadApi {
  static download = (code: string, password?: string) => {
    window.open(`${BASE_URL}/api/download/${code}${getPasswordParam(password)}`, '_self')
  }
}
