export function LogMiddleware(req: Request, res: Response, next: Function) {
  const { method, url } = req
  if (!url.startsWith('/api/fs/thumbnail') && !url.startsWith('/api/fs/avatar')) {
    console.log(method.padEnd(6, ' '), decodeURIComponent(url))
  }
  next()
}
