import { readFileSync, writeFileSync } from 'fs'
import { IDownloadTunnel } from 'src/types/download.type'
import { GAGU_PATH } from './constant.util'

export const writeDownloadTunnelData = (
  downloadTunnelList: IDownloadTunnel[],
) => {
  writeFileSync(GAGU_PATH.DATA_DOWNLOADS, JSON.stringify(downloadTunnelList))
}

export const readDownloadTunnelData = () => {
  const dataStr = readFileSync(GAGU_PATH.DATA_DOWNLOADS).toString('utf-8')
  const downloadTunnelList: IDownloadTunnel[] = JSON.parse(dataStr)
  return downloadTunnelList
}
