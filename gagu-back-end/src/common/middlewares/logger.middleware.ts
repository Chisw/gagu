import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { DateTime } from 'luxon'
import { AuthService } from '../../modules/auth/auth.service'
import { getReqToken, writeLog } from '../../utils'
import * as chalk from 'chalk'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now()
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
      const now = DateTime.now()
      const dateTime = now.toFormat('yyyy-MM-dd HH:mm:ss')
      const ipStr = String(ip).replace('::ffff:', '')
      const userInfo = `${username}@${ipStr}`
      const status = `${method}/${statusCode}`
      const urlStr = decodeURIComponent(originalUrl)

      res.once('finish', () => {
        const interval = `${Date.now() - startTime}ms`

        const logRowConsole = `${chalk.green('[GAGU-LOG]')} ${dateTime} ${chalk.green(userInfo)} ${status} ${chalk.yellow(interval)} ${urlStr}`
        console.log(logRowConsole)

        const logRowText = `${dateTime} ${userInfo} ${status} ${interval} ${urlStr}\n`
        writeLog(now.toFormat('yyyy-MM-dd'), logRowText)
      })
    }
    next()
  }
}
