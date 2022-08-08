import { getFileNameExtension } from '.'
import { IEntry, IRootInfo, IVolume } from './types'

export const rootInfoConverter: (data: any) => IRootInfo = data => {
  const { deviceName, entries } = data
  const volumeList: IVolume[] = entries
    .sort((a: any, b: any) => a.name.length > b.name.length ? -1 : 1)
  volumeList.forEach((vol: any) => vol.mount = '/')
  return {
    deviceName,
    volumeList,
  }
}

export const entryConverter = (data: { entries: any[] }, currentDirPath: string) => {
  const { entries } = data
  return entries.map(({
    name,
    type,
    size,
    hidden,
    lastModified,
    hasChildren,
  }: any) => {
    const extension = type === 'directory'
      ? `_dir${hasChildren ? '' : '_empty'}`
      : getFileNameExtension(name)

    const entry: IEntry = {
      name,
      type,
      size,
      hidden,
      lastModified,
      hasChildren,
      parentPath: currentDirPath,
      extension,
    }
    return entry
  })
}
