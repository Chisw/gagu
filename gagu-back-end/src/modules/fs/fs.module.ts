import { Module, forwardRef } from '@nestjs/common'
import { FsController } from './fs.controller'
import { FsService } from './fs.service'
import { SettingModule } from '../setting/setting.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [forwardRef(() => UserModule), SettingModule],
  controllers: [FsController],
  providers: [FsService],
  exports: [FsService],
})
export class FsModule {}
