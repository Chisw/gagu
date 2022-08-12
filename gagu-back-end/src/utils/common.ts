import * as os from 'os'

export const hashCode = (str: string) => {
  let hash = 0
  if (str.length === 0) return '0'
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash as number).toString(36) as string
}

export const getFileNameExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return undefined
  return name.split('.').reverse()[0].toLowerCase()
}

export const getDeviceInfo = () => {
  const deviceInfo = {
    username: os.userInfo().username,
    hostname: os.hostname(),
    platform: os.platform(),
  }
  return deviceInfo
}
