import { atom } from 'recoil'
import { EntryType, IApp, IEntry } from '../types'

export const entryListMapState = atom<{ [KEY: string]: IEntry[] }>({
  key: 'entryListMapState',
  default: {},
})

export const sizeMapState = atom<{ [KEY: string]: number }>({
  key: 'sizeMapState',
  default: {},
})

export const entrySelectorState = atom<{
  show: boolean
  app?: IApp
  multiple?: boolean
  only?: EntryType.directory | EntryType.file
}>({
  key: 'entrySelectorState',
  default: {
    show: false,
  },
})