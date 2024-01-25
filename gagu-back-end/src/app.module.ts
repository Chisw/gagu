import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ApiGuard } from './common/guards/api.guard'
import { LoggerMiddleware } from './common/middlewares/logger.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { FsModule } from './modules/fs/fs.module'
import { TunnelModule } from './modules/tunnel/tunnel.module'
import { TermuxModule } from './modules/termux/termux.module'
import { SettingModule } from './modules/setting/setting.module'
import { UserModule } from './modules/user/user.module'
import { IS_DEV } from './utils'

// If only starting the backend service, build the frontend code first
const devRootPath = join(__dirname, '..', '..', 'gagu-front-end', 'build')
const prodRootPath = join(__dirname, 'public')
const rootPath = IS_DEV ? devRootPath : prodRootPath

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath }),
    AuthModule,
    UserModule,
    FsModule,
    TunnelModule,
    TermuxModule,
    SettingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
