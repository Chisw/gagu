import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'node:path'
import { ApiGuard } from './common/guards/api.guard'
import { LoggerMiddleware } from './common/middlewares/logger.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { FsModule } from './modules/fs/fs.module'
import { TunnelModule } from './modules/tunnel/tunnel.module'
import { TermuxModule } from './modules/termux/termux.module'
import { SettingModule } from './modules/setting/setting.module'
import { UserModule } from './modules/user/user.module'
import { IS_DEV } from './utils'

// If only starting the backend service, build the front-end code first
const devPath = join(__dirname, '..', '..', 'gagu-front-end', 'build')
const prodPath = join(__dirname, 'web')
const rootPath = IS_DEV ? devPath : prodPath

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
