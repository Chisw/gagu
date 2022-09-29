import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ApiGuard } from './common/guards/api.guard'
import { AuthModule } from './models/auth/auth.module'
import { FsModule } from './models/fs/fs.module'
import { IS_DEV } from './utils'

// build before use
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
    FsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
export class AppModule {}
