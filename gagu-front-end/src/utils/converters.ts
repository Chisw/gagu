import { getFileNameExtension } from '.'
import { IEntry, IRootInfo, IVolume } from './types'

export const rootInfoConverter: (data: any) => IRootInfo = data => {
  const { deviceName, files } = data
  const volumeList: IVolume[] = files
    .sort((a: any, b: any) => a.mount.length > b.mount.length ? -1 : 1)
  return {
    deviceName,
    volumeList,
  }
}

export const entryConverter = (data: { files: any[] }, currentDirPath: string) => {
  const { files } = data
  return files.map(({
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
