import { exec, spawn } from 'child_process'
import { OS } from './constant.util'
import * as md5 from 'md5'
import { Request } from 'express'

export const genToken = () => md5(Math.random().toString())

export const getReqToken = (req: Request) => {
  const authorization = req.header('Authorization') || ''
  const queryToken = (req.query.token || '') as string
  const token = authorization || queryToken
  return token
}

export const openInBrowser = (url: string) => {
  if (OS.isMacOS) {
    exec(`open ${url}`)
  } else if (OS.isWindows) {
    exec(`start ${url}`)
  } else {
    spawn('xdg-open', [url])
  }
}

export const getExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return ''
  return name.split('.').reverse()[0].toLowerCase()
}

export const dataURLtoBlob = (base64: string) => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

export const blobToFile = (blob: Blob, fileName: string) => {
  const file: File = {
    ...blob,
    name: fileName,
    lastModified: Date.now(),
    webkitRelativePath: '',
  }
  return file
}

export const dataURLtoFile = (base64: string, fileName: string) => {
  return blobToFile(dataURLtoBlob(base64), fileName)
}

export const dataURLtoBuffer = (base64: string) => {
  const regex = /^data:.+\/(.+);base64,(.*)$/
  const matches = base64.match(regex)
  if (matches) {
    const [, , data] = matches
    const buffer = Buffer.from(data, 'base64')
    return buffer
  } else {
    return null
  }
}
