import { atom } from 'recoil'
import {
  IApp,
  IBaseData,
  IOpenEvent,
  IContextMenuState,
  IUserInfo,
  Page,
  IEntryPathMap,
  IEntrySelectorEvent,
  ITransferTask,
} from '../types'

export const userInfoState = atom<IUserInfo | null>({
  key: 'userInfoState',
  default: null,
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
    desktopEntryList: [],
    rootEntryList: [],
    favoriteEntryList: [],
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

export const entryPathMapState = atom<IEntryPathMap>({
  key: 'entryPathMapState',
  default: {},
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

export const lastChangedDirectoryState = atom<{ path: string, timestamp: number }>({
  key: 'lastChangedDirectoryState',
  default: {
    path: '',
    timestamp: 0,
  },
})
