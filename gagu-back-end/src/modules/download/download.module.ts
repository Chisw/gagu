import { AuthModule } from './../auth/auth.module'
import { Module } from '@nestjs/common'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'
import { UserModule } from '../user/user.module'
import { FsModule } from '../fs/fs.module'

@Module({
  imports: [AuthModule, UserModule, FsModule],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
