import { Module } from '@nestjs/common'
import { FsController } from './fs.controller'
import { FsService } from './fs.service'

@Module({
  controllers: [FsController],
  providers: [FsService],
})
export class FsModule {}
