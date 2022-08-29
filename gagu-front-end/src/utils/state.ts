import { atom } from 'recoil'
import {
  IApp,
  IEntry,
  IRootInfo,
  IOpenOperation,
  IContextMenuState,
  ITransferTask,
} from '../types'

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

export const transferSignalState = atom<number>({
  key: 'transferSignalState',
  default: 0
})

export const transferTaskListState = atom<ITransferTask[]>({
  key: 'transferTaskListState',
  default: [],
})

export const contextMenuDataState = atom<IContextMenuState | null>({
  key: 'contextMenuDataState',
  default: null,
})