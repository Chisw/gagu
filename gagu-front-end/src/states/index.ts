import { atom } from 'recoil'
import {
  IApp,
  IBaseData,
  IOpenEvent,
  IContextMenuState,
  IUserInfo,
  Page,
  IEntryPathCache,
  IUploadTask,
  IUserConfig,
  IClipboardData,
  IWindowInfo,
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

export const clipboardDataState = atom<IClipboardData | null>({
  key: 'clipboardDataState',
  default: null,
})

export const openEventState = atom<IOpenEvent | null>({
  key: 'openEventState',
  default: null,
})

export const uploadSignalState = atom<number>({
  key: 'uploadSignalState',
  default: 0
})

export const uploadTaskListState = atom<IUploadTask[]>({
  key: 'uploadTaskListState',
  default: [],
})

export const lastChangedDirectoryState = atom<{ path: string, timestamp: number, otherPaths?: string[] }>({
  key: 'lastChangedDirectoryState',
  default: {
    path: '',
    timestamp: 0,
  },
})

export const demoWindowInfoState = atom<IWindowInfo | null>({
  key: 'demoWindowInfoState',
  default: null,
})
