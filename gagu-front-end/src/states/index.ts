import { atom } from 'recoil'
import {
  IApp,
  IBaseData,
  IOpenEvent,
  IContextMenuState,
  IUserInfo,
  Page,
  IEntryPathCache,
  IEntrySelectorEvent,
  ITransferTask,
  IUserConfig,
} from '../types'
import { EntryPathCacheStore, UserConfigStore } from '../utils/store.util'

export const userInfoState = atom<IUserInfo | null>({
  key: 'userInfoState',
  default: null,
})

export const userConfigState = atom<IUserConfig>({
  key: 'userConfigState',
  default: UserConfigStore.get(),
})

export const baseDataState = atom<IBaseData>({
  key: 'baseDataState',
  default: {
    version: 'v-.-.-',
    serverOS: {
      username: '',
      host: '',
      hostname: '',
      platform: '',
      isMacOS: false,
      isWindows: false,
      isLinux: false,
      isAndroid: false,
      supportThumbnail: false,
      supportCompression: false,
      supportCurl: false,
    },
    deviceName: '--',
    rootEntryList: [],
    userPath: '',
  },
})

export const activePageState = atom<Page>({
  key: 'activePageState',
  default: Page.PENDING
})

export const runningAppListState = atom<IApp[]>({
  key: 'runningAppListState',
  default: [],
})

export const topWindowIndexState = atom<number>({
  key: 'topWindowIndexState',
  default: 0,
})

export const contextMenuDataState = atom<IContextMenuState | null>({
  key: 'contextMenuDataState',
  default: null,
})

export const entryPathCacheState = atom<IEntryPathCache>({
  key: 'entryPathCacheState',
  default: EntryPathCacheStore.get(),
})

export const openEventState = atom<IOpenEvent | null>({
  key: 'openEventState',
  default: null,
})

export const entrySelectorEventState = atom<IEntrySelectorEvent | null>({
  key: 'entrySelectorEventState',
  default: null,
})

export const transferSignalState = atom<number>({
  key: 'transferSignalState',
  default: 0
})

export const transferTaskListState = atom<ITransferTask[]>({
  key: 'transferTaskListState',
  default: [],
})

export const lastChangedDirectoryState = atom<{ path: string, timestamp: number, otherPaths?: string[] }>({
  key: 'lastChangedDirectoryState',
  default: {
    path: '',
    timestamp: 0,
  },
})
