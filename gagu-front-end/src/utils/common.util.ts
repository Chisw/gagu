import { DateTime } from 'luxon'
import { IOffsetInfo, ILassoInfo, PublicImageName, ExistingStrategyType } from '../types'
import md5 from 'md5'
import { FsApi } from '../api'
import default_favicon from '../img/favicon.png'
import { ACCESS_TOKEN_KEY } from './constant.util'
import { UserInfoStore } from './store.util'

export const copy = (str: string) => {
  const input = document.createElement('textarea')
  document.body.appendChild(input)
  input.value = str
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
}

export const line = (str: string) => str
  .replace(/\n/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const sleep = async (duration: number) => {
  await new Promise((resolve) => setTimeout(resolve, duration))
}

export const getDateTime = (millis: number) => {
  if (!millis) return ''
  return DateTime.fromMillis(millis).toFormat('yyyy-MM-dd HH:mm:ss')
}

export const getPopupContainer: () => HTMLElement = () => {
  return document.querySelector('.gagu-app-window.is-top-window') || document.body
}

interface getReadableSizeOption {
  keepFloat?: boolean
  separator?: string
}

export const getReadableSize = (size: number, kiloSize: 1000 | 1024, options?: getReadableSizeOption) => {
  const {
    keepFloat = false,
    separator = '',
  } = options || {}

  const stepList = [kiloSize, Math.pow(kiloSize, 2), Math.pow(kiloSize, 3), Math.pow(kiloSize, 4)]

  let unit = ''
  if (!unit) {
    if (0 <= size && size < stepList[0]) {
      unit = 'B'
    } else if (stepList[0] <= size && size < stepList[1]) {
      unit = 'KB'
    } else if (stepList[1] <= size && size < stepList[2]) {
      unit = 'MB'
    } else if (stepList[2] <= size && size < stepList[3]) {
      unit = 'GB'
    } else {
      unit = 'TB'
    }
  }
  const level = ['B', 'KB', 'MB', 'GB', 'TB'].indexOf(unit)
  const divisor = [1, ...stepList][level]
  const fixedSize = (size / divisor).toFixed(unit === 'B' ? 0 : 1)
  const readableSize = keepFloat ? fixedSize : fixedSize.replace('.0', '')
  return `${readableSize}${separator}${unit}`
}

export const getIsCovered = (props: ILassoInfo & IOffsetInfo) => {
  const {
    startX,
    startY,
    endX,
    endY,
    offsetTop,
    offsetLeft,
    offsetWidth,
    offsetHeight,
  } = props

  return offsetLeft + offsetWidth > startX &&
    offsetTop + offsetHeight > startY &&
    offsetLeft < endX &&
    offsetTop < endY
}

export const getImageTypeBase64ByURL = async (url: string, options?: { width?: number, height?: number, bgColor?: string, usePNG?: boolean }) => {
  const {
    width,
    height,
    bgColor,
    usePNG = false,
  } = options || {}

  return new Promise<string>((resolve, reject) => {
    const img = document.createElement('img')
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      const w = width || img.naturalWidth
      const h = width
        ? height
          ? height
          : width / ratio
        : img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx!.fillStyle = bgColor || 'transparent'
      ctx!.fillRect(0, 0, w, h)
      ctx!.drawImage(img, 0, 0, w, h)
      const base64: string = canvas.toDataURL(`image/${usePNG ? 'png' : 'jpeg'}`, 1)
      resolve(base64)
    }
    img.onerror = (error) => {
      reject(`error`)
    }
    img.src = url
  })
}

export const getIndexLabel = (currentIndex: number, total: number, options?: { minWidth?: number, hideTotal?: boolean }) => {
  const {
    minWidth = 2,
    hideTotal = false,
  } = options || { minWidth: 2, hideTotal: false }
  const width = Math.max(String(total).length, minWidth)
  const i = total === 0 ? -1 : currentIndex
  const currentNo = String(i + 1).padStart(width, '0')
  const totalNo = total.toString().padStart(width, '0')
  return `${currentNo}${hideTotal ? '' : `/${totalNo}`}`
}

export const getAccessTokenParam = () => {
  return `${ACCESS_TOKEN_KEY}=${UserInfoStore.getAccessToken()}`
}

export const getPasswordParam = (password?: string) => {
  return password ? `password=${md5(password)}` : ''
}

export const getPathParam = (path: string) => {
  return `path=${encodeURIComponent(path)}`
}

export const getTimestampParam = (timestamp?: number) => {
  return `timestamp=${timestamp || Date.now()}`
}

export const getExistingStrategyParam = (strategy?: ExistingStrategyType) => {
  return strategy ? `existingStrategy=${strategy}` : ''
}

// TODO:
export const getBaiduMapPinUrl = (exifData: any, content?: string) => {
  const { GPS } = exifData || {}
  const { GPSLatitude, GPSLongitude } = GPS || {}
  if (GPSLatitude && GPSLongitude) {
    const [[a, b], [c, d], [e, f]] = GPSLatitude as any
    const [[g, h], [i, j], [k, l]] = GPSLongitude as any
    const lat = a / b + c / d / 60 + e / f / 3600
    const lon = g / h + i / j / 60 + k / l / 3600

    const query = new URLSearchParams({
      location: `${lat},${lon}`,
      title: '图片位置-GAGU.IO',
      content,
      output: 'html',
      coord_type: 'wgs84',
    } as any)

    return `https://api.map.baidu.com/marker?${query.toString()}`
    // return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
  } else {
    return ''
  }
}

// TODO:
export const getBaiduMapLocationUrl = (longitude: number, latitude: number) => {
  if (latitude && longitude) {
    const query = new URLSearchParams({
      location: `${latitude},${longitude}`,
      title: 'Location',
      output: 'html',
      coord_type: 'wgs84',
    } as any)

    return `https://api.map.baidu.com/marker?${query.toString()}`
    // return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
  } else {
    return ''
  }
}

export const refreshImage = (name: PublicImageName) => {
  document.querySelectorAll(`.gagu-public-image-${name}`).forEach((el) => {
    el.removeAttribute('style')
    el.setAttribute('style', `background-image: url("${`${FsApi.getPublicImageStreamUrl(name)}?temp=${Date.now()}`}")`)
  })
}

export const setFavicon = async (imgUrl: string) => {
  const set = (dataURL: string) => {
    const link: any = document.querySelector('link[rel*=icon]') || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = dataURL
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  const options = { width: 32, usePNG: true }
  try {
    const base64 = await getImageTypeBase64ByURL(imgUrl, options)
    set(base64)
  } catch (error) {
    set(default_favicon)
  }
}

export const setInputSelection = (input: HTMLInputElement, start: number, end: number) => {
  const selection = document as any
  if (typeof input.selectionStart != 'undefined') {
    input.selectionStart = start
    input.selectionEnd = end
  } else if (selection && selection.createRange) {
    input.select()
    var range = selection.createRange()
    range.collapse(true)
    range.moveEnd('character', end)
    range.moveStart('character', start)
    range.select()
  }
}

export const vibrate = (p?: VibratePattern) => {
  window.navigator.vibrate(p || 1)
}

export const generateNewName = () => {
  return DateTime.local().toFormat('yyyyMMdd-HHmmss')
}

export const generateTextFile = (text: string, name: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const file = new File([blob], name)
  return file
}

// Sync following code to BE & FE
export const generateRandomCode = () => md5(Math.random().toString())

export const generateRandomToken = () => {
  return Buffer.from(generateRandomCode()).toString('base64')
}

export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
