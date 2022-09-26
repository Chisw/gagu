import { atom } from 'recoil'
import {
  IApp,
  IRootInfo,
  IOpenOperation,
  IContextMenuState,
} from '../types'

export const rootInfoState = atom<IRootInfo>({
  key: 'rootInfoState',
  default: {
    version: 'v-.-.-',
    platform: '',
    deviceName: '--',
    desktopEntryList: [],
    rootEntryList: [],
  },
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
