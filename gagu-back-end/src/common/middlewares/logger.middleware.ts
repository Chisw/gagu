import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { DateTime } from 'luxon'
import { AuthService } from '../../modules/auth/auth.service'
import { getReqToken } from '../../utils'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = getReqToken(req)
    const username = this.authService.findOneUsername(token) || 'UNKNOWN'
    const { method, originalUrl, ip } = req
    const { statusCode } = res
    if (
      originalUrl.startsWith('/api/') &&
      !originalUrl.startsWith('/api/fs/thumbnail') &&
      !originalUrl.startsWith('/api/fs/avatar') &&
      !originalUrl.startsWith('/api/fs/background') &&
      !originalUrl.startsWith('/api/fs/tags')
    ) {
      const dateTime = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
      const ipStr = String(ip).replace('::ffff:', '')
      const urlStr = decodeURIComponent(originalUrl)
      const logRow = `[${dateTime}] ${username}@${ipStr} [${method}/${statusCode}] ${urlStr}`
      console.log(logRow)
    }
    next()
  }
}
