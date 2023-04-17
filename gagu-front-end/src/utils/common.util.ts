import { DateTime } from 'luxon'
import { IOffsetInfo, IRectInfo } from '../types'
import md5 from 'md5'

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

export const getDateTime = (millis: number) => {
  if (!millis) return ''
  return DateTime.fromMillis(millis).toFormat('yyyy-MM-dd HH:mm:ss')
}

interface getReadableSizeOption {
  keepFloat?: boolean
  separator?: string
  stepSize?: 1000 | 1024
}

export const getReadableSize = (size: number, options?: getReadableSizeOption) => {
  const {
    keepFloat = false,
    separator = '',
    stepSize = 1024,
  } = options || {}

  const stepList = [stepSize, Math.pow(stepSize, 2), Math.pow(stepSize, 3), Math.pow(stepSize, 4)]

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

export const getIsContained = (props: IRectInfo & IOffsetInfo) => {
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

  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      const w = width || img.naturalWidth
      const h = height || img.naturalHeight
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
      reject(error)
    }
    img.src = url
  })
}

export const getPaddedNo = (currentIndex: number, total: number, options?: { minWidth?: number, hideTotal?: boolean }) => {
  const {
    minWidth = 2,
    hideTotal = false,
  } = options || { minWidth: 2, hideTotal: false }
  const width = Math.max(String(total).length, minWidth)
  const i = total === 0 ? -1 : currentIndex
  const currentNo = String(i + 1).padStart(width, '0')
  const totalNo = total.toString().padStart(width, '0')
  return `${currentNo}${hideTotal ? '' : ` / ${totalNo}`}`
}

export const getPasswordParam = (password?: string) => {
  return password ? `?password=${md5(password)}` : ''
}

export const getBaiduMapPinUrl = (ExifData: any, content?: string) => {
  const { GPS } = ExifData || {}
  const { GPSLatitude, GPSLongitude } = GPS || {}
  if (GPSLatitude && GPSLongitude) {
    const [[a, b], [c, d], [e, f]] = GPSLatitude as any
    const [[g, h], [i, j], [k, l]] = GPSLongitude as any
    const lat = a / b + c / d / 60 + e / f / 3600
    const lon = g / h + i / j / 60 + k / l / 3600

    const query = new URLSearchParams({
      location: `${lat},${lon}`,
      title: '图片位置-GAGU',
      content,
      output: 'html',
      coord_type: 'wgs84',
    } as any)

    return `https://api.map.baidu.com/marker?${query.toString()}`
  } else {
    return ''
  }
}

// Sync following code to BE & FE
export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
