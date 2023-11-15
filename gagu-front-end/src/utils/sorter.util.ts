import { IEntry, Sort } from '../types'

export const defaultSorter = (a: IEntry, b: IEntry) => {
  const map = { directory: 1, file: 2 }
  const aVal = map[a.type]
  const bVal = map[b.type]
  const typeDirection = aVal - bVal
  if (typeDirection !== 0) return typeDirection
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const nameSorter = (a: IEntry, b: IEntry) => {
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const nameDescSorter = (a: IEntry, b: IEntry) => {
  return - a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const sizeSorter = (a: IEntry, b: IEntry) => {
  return (a.size || 0) - (b.size || 0)
}

export const sizeDescSorter = (a: IEntry, b: IEntry) => {
  return - ((a.size || 0) - (b.size || 0))
}

export const extensionSorter = (a: IEntry, b: IEntry) => {
  return a.extension.toLowerCase().localeCompare(b.extension.toLowerCase())
}

export const extensionDescSorter = (a: IEntry, b: IEntry) => {
  return - a.extension.toLowerCase().localeCompare(b.extension.toLowerCase())
}

export const lastModifiedSorter = (a: IEntry, b: IEntry) => {
  return a.lastModified - b.lastModified
}

export const lastModifiedDescSorter = (a: IEntry, b: IEntry) => {
  return - (a.lastModified - b.lastModified)
}

export const sortMethodMap = {
  [Sort.default]: defaultSorter,
  [Sort.name]: nameSorter,
  [Sort.nameDesc]: nameDescSorter,
  [Sort.size]: sizeSorter,
  [Sort.sizeDesc]: sizeDescSorter,
  [Sort.extension]: extensionSorter,
  [Sort.extensionDesc]: extensionDescSorter,
  [Sort.lastModified]: lastModifiedSorter,
  [Sort.lastModifiedDesc]: lastModifiedDescSorter,
}
