import { AuthModule } from './../auth/auth.module'
import { FsService } from '../fs/fs.service'
import { Module } from '@nestjs/common'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'

@Module({
  imports: [AuthModule],
  controllers: [DownloadController],
  providers: [DownloadService, FsService],
})
export class DownloadModule {}
