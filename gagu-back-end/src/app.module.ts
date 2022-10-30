import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ApiGuard } from './common/guards/api.guard'
import { LoggerMiddleware } from './common/middlewares/logger.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { DownloadModule } from './modules/download/download.module'
import { FsModule } from './modules/fs/fs.module'
import { UserModule } from './modules/user/user.module'
import { IS_DEV } from './utils'

// build FE before use dev
const devRootPath = join(__dirname, '..', '..', '..', 'gagu-front-end', 'build')
const prodRootPath = join(__dirname, 'public')
const rootPath = IS_DEV ? devRootPath : prodRootPath

@Module({
  imports: [
    ServeStaticModule.forRoot(
      { rootPath, serveRoot: '/' },
      { rootPath, serveRoot: '/login' },
      { rootPath, serveRoot: '/mobile' },
    ),
    AuthModule,
    UserModule,
    FsModule,
    DownloadModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
