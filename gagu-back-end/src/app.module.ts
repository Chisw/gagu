import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ListController } from './controllers/list/list.controller'

@Module({
  imports: [],
  controllers: [AppController, ListController],
  providers: [AppService],
})
export class AppModule {}
