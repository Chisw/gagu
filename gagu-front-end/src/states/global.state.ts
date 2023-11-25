import { atom } from 'recoil'
import {
  IApp,
  IBaseData,
  IOpenOperation,
  IContextMenuState,
  IUserInfo,
  Page,
  IEntryPathMap,
  IEntrySelectorOperation,
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
    favoritePathList: [],
  },
})

export const activePageState = atom<Page>({
  key: 'activePageState',
  default: Page.PENDING
})

export const topWindowIndexState = atom<number>({
  key: 'topWindowIndexState',
  default: 0,
})

export const runningAppListState = atom<IApp[]>({
  key: 'runningAppListState',
  default: [],
})

export const openOperationState = atom<IOpenOperation | null>({
  key: 'openOperationState',
  default: null,
})

export const contextMenuDataState = atom<IContextMenuState | null>({
  key: 'contextMenuDataState',
  default: null,
})

export const entrySelectorOperationState = atom<IEntrySelectorOperation | null>({
  key: 'entrySelectorOperationState',
  default: null,
})

export const entryPathMapState = atom<IEntryPathMap>({
  key: 'entryPathMapState',
  default: {},
})
