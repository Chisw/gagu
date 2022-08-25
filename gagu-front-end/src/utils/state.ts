import { atom } from 'recoil'
import {
  IApp,
  IEntry,
  IRootInfo,
  IOpenOperation,
  IUploadTask,
  IContextMenuState,
} from './types'

export const topWindowIndexState = atom<number>({
  key: 'topWindowIndexState',
  default: 0,
})

export const runningAppListState = atom<IApp[]>({
  key: 'runningAppListState',
  default: [],
})

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

export const entryListMapState = atom<{ [KEY: string]: IEntry[] }>({
  key: 'entryListMapState',
  default: {},
})

export const sizeMapState = atom<{ [KEY: string]: number }>({
  key: 'sizeMapState',
  default: {},
})

export const openOperationState = atom<IOpenOperation | null>({
  key: 'openOperationState',
  default: null,
})

export const uploadTaskListState = atom<IUploadTask[]>({
  key: 'uploadTaskListState',
  default: [],
})

export const contextMenuState = atom<IContextMenuState | null>({
  key: 'contextMenuState',
  default: null,
})