export function LogMiddleware(req: Request, res: Response, next: Function) {
  console.log(req.method, req.url)
  next()
}
