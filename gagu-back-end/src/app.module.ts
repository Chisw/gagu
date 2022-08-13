import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppService } from './app.service'
import { AuthController } from './controllers/auth.controller'
import { FsController } from './controllers/fs.controller'
import { IS_DEV } from './utils'

const publicPath = IS_DEV
  ? join(__dirname, '..', '..', 'gagu-front-end', 'build')
  : join(__dirname, 'public')

console.log({ publicPath })

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/',
      rootPath: publicPath,
    }),
  ],
  controllers: [
    AuthController,
    FsController,
  ],
  providers: [AppService],
})
export class AppModule {}
