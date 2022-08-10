import { getFileNameExtension } from '.'
import { IEntry, IRootInfo, IVolume } from './types'

export const rootInfoConverter: (data: any) => IRootInfo = data => {
  const { deviceName, entryList } = data
  const volumeList: IVolume[] = entryList
  return {
    deviceName,
    volumeList,
  }
}

export const entryConverter = (data: { entryList: any[] }, currentDirPath: string) => {
  const { entryList } = data
  return entryList.map(({
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
