import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppController } from './controllers/app.controller'
import { ListController } from './controllers/list/list.controller'
import { SizeController } from './controllers/size/size.controller'
import { DeleteController } from './controllers/delete/delete.controller'
import { RenameController } from './controllers/rename/rename.controller'
import { ExistsController } from './controllers/exists/exists.controller'
import { AddDirectoryController } from './controllers/add-directory/add-directory.controller'
import { TextContentController } from './controllers/text-content/text-content.controller'

@Module({
  imports: [],
  controllers: [
    AppController,
    ListController,
    SizeController,
    DeleteController,
    RenameController,
    ExistsController,
    AddDirectoryController,
    TextContentController,
  ],
  providers: [AppService],
})
export class AppModule {}
