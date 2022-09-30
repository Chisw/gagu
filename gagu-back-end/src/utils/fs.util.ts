import { exec } from 'child_process'
import { accessSync, constants, mkdirSync, statSync, unlinkSync } from 'fs'
import { OS } from './constant.util'

export const getExists = (path: string) => {
  let exists = false
  try {
    accessSync(path, constants.F_OK)
    exists = true
  } catch (err) {
    exists = false
  }
  return exists
}

export const deleteEntry = (path: string) => {
  try {
    const stat = statSync(path)
    if (stat.isDirectory()) {
      exec(`rm -rf ${path}`)
    } else {
      unlinkSync(path)
    }
  } catch (err) {}
}

export const completeNestedPath = (path: string) => {
  const list = path.split('/').filter(Boolean).slice(0, -1)
  const nestedPathList = list.map((dirName, index) => {
    const prefix =
      index === 0 ? '' : '/' + list.filter((d, i) => i < index).join('/')
    return `${prefix}/${dirName}`
  })
  nestedPathList.forEach((path) => {
    const p = OS.isWindows ? path.replace('/', '') : path
    const exists = getExists(p)
    !exists && mkdirSync(p)
  })
}
