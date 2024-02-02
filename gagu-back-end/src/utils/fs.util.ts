import { accessSync, appendFile, constants, mkdirSync, promises } from 'fs'
import { GAGU_PATH, ServerOS } from './constant.util'
import { getParentPath } from './entry.util'
import { catchError } from './common.util'

export const getExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return ''
  return name.split('.').reverse()[0].toLowerCase()
}

export const getExists = (path: string) => {
  let exists = false
  try {
    accessSync(path, constants.F_OK)
    exists = true
  } catch (error) {
    exists = false
  }
  return exists
}

export const getDuplicatedPath: (path: string) => string = (path) => {
  const isExisted = getExists(path)
  if (isExisted) {
    const name = path.split('/').reverse()[0]
    const parentPath = getParentPath(path)
    const extension = getExtension(name)
    const suffix = extension ? `.${extension}` : ''
    let pureName = extension ? name.slice(0, -(extension.length + 1)) : name

    const matchRes = pureName.match(/\(\d\)$/)

    if (matchRes) {
      const [indexString] = matchRes
      const newIndex = Number(indexString.replace(/\(|\)/g, '')) + 1
      pureName = pureName.replace(/\(\d\)$/, `(${newIndex})`)
    } else {
      pureName += ' (1)'
    }

    const newPath = `${parentPath}/${pureName}${suffix}`
    return getDuplicatedPath(newPath)
  } else {
    return path
  }
}

export const removeEntry = async (path: string) => {
  return new Promise(async (resolve) => {
    try {
      await promises.rm(path, { recursive: true })
      resolve(true)
    } catch (error) {
      catchError(error)
    }
  })
}

export const completeNestedPath = (path: string) => {
  const list = path.split('/').filter(Boolean).slice(0, -1)
  const nestedPathList = list.map((dirName, index) => {
    const prefix =
      index === 0 ? '' : '/' + list.filter((d, i) => i < index).join('/')
    return `${prefix}/${dirName}`
  })
  nestedPathList.forEach((path) => {
    const p = ServerOS.isWindows ? path.replace('/', '') : path
    const exists = getExists(p)
    !exists && mkdirSync(p)
  })
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

export const writeLog = (date: string, log: string) => {
  const logFileName = `${date}.log`
  const logFilePath = `${GAGU_PATH.LOG}/${logFileName}`
  appendFile(logFilePath, log, (error) => {
    error && console.log(error)
  })
}

export const JSONFormat = (data: any) => {
  let json = JSON.stringify(data)
  const p: string[] = []

  const push = (m: string) => `\\${p.push(m)}\\`
  const pop = (m: string, i: number) => p[i - 1]
  const tabs = (count: number) => new Array(count + 1).join('  ')

  let out = ''
  let indent = 0

  json = json
    .replace(/\\./g, push)
    .replace(/(".*?"|'.*?')/g, push)
    .replace(/\s+/, '')

  for (let i = 0; i < json.length; i++) {
    const c = json.charAt(i)

    switch (c) {
      case '{':
      case '[':
        out += c + '\n' + tabs(++indent)
        break
      case '}':
      case ']':
        out += '\n' + tabs(--indent) + c
        break
      case ',':
        out += ',\n' + tabs(indent)
        break
      case ':':
        out += ': '
        break
      default:
        out += c
        break
    }
  }

  out = out
    .replace(/\[[\d,\s]+?\]/g, (m) => m.replace(/\s/g, ''))
    .replace(/\\(\d+)\\/g, pop)
    .replace(/\\(\d+)\\/g, pop)

  return out
}
