import { Module } from '@nestjs/common'
import { SettingController } from './setting.controller'
import { SettingService } from './setting.service'

@Module({
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
