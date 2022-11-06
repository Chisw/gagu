import { Module } from '@nestjs/common'
import { FsController } from './fs.controller'
import { FsService } from './fs.service'
import { SettingModule } from '../setting/setting.module'

@Module({
  imports: [SettingModule],
  controllers: [FsController],
  providers: [FsService],
})
export class FsModule {}
