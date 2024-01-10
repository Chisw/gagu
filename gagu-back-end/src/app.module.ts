import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ApiGuard } from './common/guards/api.guard'
import { LoggerMiddleware } from './common/middlewares/logger.middleware'
import { AndroidModule } from './modules/android/android.module'
import { AuthModule } from './modules/auth/auth.module'
import { DownloadModule } from './modules/download/download.module'
import { FsModule } from './modules/fs/fs.module'
import { TunnelModule } from './modules/tunnel/tunnel.module'
import { SettingModule } from './modules/setting/setting.module'
import { UserModule } from './modules/user/user.module'
import { IS_DEV } from './utils'

// build FE before use dev
const devRootPath = join(__dirname, '..', '..', '..', 'gagu-front-end', 'build')
const prodRootPath = join(__dirname, 'public')
const rootPath = IS_DEV ? devRootPath : prodRootPath

@Module({
  imports: [
    ServeStaticModule.forRoot(
      // sync to routers in front-end
      { rootPath, serveRoot: '/' },
      { rootPath, serveRoot: '/login' },
      { rootPath, serveRoot: '/desktop' },
      { rootPath, serveRoot: '/explore' },
      { rootPath, serveRoot: '/touch' },
      { rootPath, serveRoot: '/sharing' },
    ),
    AuthModule,
    UserModule,
    FsModule,
    TunnelModule,
    DownloadModule,
    AndroidModule,
    SettingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
