import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { DateTime } from 'luxon'
import { AuthService } from '../../modules/auth/auth.service'
import { getRequestToken, writeLog } from '../../utils'
import * as chalk from 'chalk'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now()
    const token = getRequestToken(request)
    const username = this.authService.findOneUsername(token) || 'UNKNOWN'
    const { originalUrl } = request

    const skippableList = [
      '/api/auth/pulse',
      '/api/fs/avatar',
      '/api/fs/image',
      '/api/fs/tags',
      '/api/fs/thumbnail',
    ]

    if (
      originalUrl.startsWith('/api/') &&
      skippableList.every((item) => !originalUrl.startsWith(item))
    ) {
      const { method, body, ip: IP } = request
      const { statusCode } = response
      const nowTime = DateTime.now()
      const datetime = nowTime.toFormat('yyyy-MM-dd HH:mm:ss')
      const ip = String(IP).replace('::ffff:', '')
      const userInfo = `${username}@${ip}`
      const status = `${method}/${statusCode}`
      const url = decodeURIComponent(originalUrl)

      response.once('finish', () => {
        const duration = `${Date.now() - startTime}ms`

        // eslint-disable-next-line prettier/prettier
        console.log(`${chalk.green('[GAGU-LOG]')} ${datetime} ${chalk.green(userInfo)} ${status} ${chalk.yellow(duration)} ${url}`)

        const row = {
          datetime,
          ip,
          username,
          method,
          url,
          statusCode,
          duration,
          body,
        }

        writeLog(nowTime.toFormat('yyyy-MM-dd'), JSON.stringify(row) + '\n')
      })
    }
    next()
  }
}
