import { getDeviceInfo } from './common'
import { IVolume } from 'src/types'

const { username, platform } = getDeviceInfo()

export const getMockRootEntryList = () => {
  const rootEntryList: IVolume[] = []
  if (platform === 'darwin') {
    rootEntryList.push(
      {
        name: 'Home',
        type: 'directory',
        size: undefined,
        hidden: false,
        lastModified: 0,
        hasChildren: false,
        mount: `/Users/${username}`,
        isVolume: false,
        spaceFree: 82341341312,
        spaceTotal: 212341341312,
      },
      {
        name: 'Volumes',
        type: 'directory',
        size: undefined,
        hidden: false,
        lastModified: 0,
        hasChildren: false,
        mount: '/Volumes',
        isVolume: false,
        spaceFree: 82341341312,
        spaceTotal: 212341341312,
      },
    )
  } else if (platform === 'android') {
    rootEntryList.push(
      {
        name: 'Home',
        type: 'directory',
        size: undefined,
        hidden: false,
        lastModified: 0,
        hasChildren: false,
        mount: '/data/data/com.termux/files/home',
        isVolume: false,
        spaceFree: 82341341312,
        spaceTotal: 212341341312,
      },
      {
        name: 'Shared',
        type: 'directory',
        size: undefined,
        hidden: false,
        lastModified: 0,
        hasChildren: false,
        mount: '/data/data/com.termux/files/home/storage/shared',
        isVolume: false,
        spaceFree: 82341341312,
        spaceTotal: 212341341312,
      },
    )
  }
  return rootEntryList
}