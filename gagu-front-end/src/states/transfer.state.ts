import { atom } from 'recoil'
import { ITransferTask } from '../types'

export const transferSignalState = atom<number>({
  key: 'transferSignalState',
  default: 0
})

export const transferTaskListState = atom<ITransferTask[]>({
  key: 'transferTaskListState',
  default: [],
})

export const lastChangedPathState = atom<{ path: string, timestamp: number }>({
  key: 'lastChangedPathState',
  default: {
    path: '',
    timestamp: 0,
  },
})
