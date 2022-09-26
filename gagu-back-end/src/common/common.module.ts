import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { IS_DEV } from 'src/utils'
import { ApiGuard } from './guards/api.guard'

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
      { rootPath, serveRoot: '/lock' },
    ),
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
export class CommonModule {}
