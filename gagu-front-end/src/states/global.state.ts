import { atom } from 'recoil'
import {
  IApp,
  IRootInfo,
  IOpenOperation,
  IContextMenuState,
  IUserInfo,
  Page,
} from '../types'

export const userInfoState = atom<IUserInfo | null>({
  key: 'userInfoState',
  default: null,
})

export const rootInfoState = atom<IRootInfo>({
  key: 'rootInfoState',
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
