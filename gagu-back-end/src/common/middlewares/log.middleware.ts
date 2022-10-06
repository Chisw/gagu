import { DateTime } from 'luxon'

export function LogMiddleware(req: Request, res: Response, next: Function) {
  const { method, url, ip } = req as any
  if (!url.startsWith('/api/fs/thumbnail') && !url.startsWith('/api/fs/avatar')) {
    const dateTime = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    const ipStr = String(ip).replace('::ffff:', '').padEnd(16, ' ')
    const methodStr = method.padEnd(6, ' ')
    const urlStr = decodeURIComponent(url)
    console.log(dateTime, ipStr, methodStr, urlStr)
  }
  next()
}
