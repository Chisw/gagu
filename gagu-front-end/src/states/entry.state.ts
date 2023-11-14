import { atom } from 'recoil'
import { EntryType, IApp, IEntryPathMap } from '../types'

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

export const entryPathMapState = atom<IEntryPathMap>({
  key: 'entryPathMapState',
  default: {},
})
