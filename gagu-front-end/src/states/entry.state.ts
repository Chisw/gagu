import { atom } from 'recoil'
import { IEntry } from '../types'

export const entryListMapState = atom<{ [KEY: string]: IEntry[] }>({
  key: 'entryListMapState',
  default: {},
})

export const sizeMapState = atom<{ [KEY: string]: number }>({
  key: 'sizeMapState',
  default: {},
})
