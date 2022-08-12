import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppService } from './app.service'
import { LoginController } from './controllers/auth/login/login.controller'
import { ListController } from './controllers/fs/list/list.controller'
import { SizeController } from './controllers/fs/size/size.controller'
import { DeleteController } from './controllers/fs/delete/delete.controller'
import { RenameController } from './controllers/fs/rename/rename.controller'
import { ExistsController } from './controllers/fs/exists/exists.controller'
import { AddDirectoryController } from './controllers/fs/add-directory/add-directory.controller'
import { TextContentController } from './controllers/fs/text-content/text-content.controller'
import { ThumbnailController } from './controllers/fs/thumbnail/thumbnail.controller'
import { FileController } from './controllers/fs/file/file.controller'
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
    LoginController,
    ListController,
    SizeController,
    DeleteController,
    RenameController,
    ExistsController,
    AddDirectoryController,
    TextContentController,
    ThumbnailController,
    FileController,
  ],
  providers: [AppService],
})
export class AppModule {}
