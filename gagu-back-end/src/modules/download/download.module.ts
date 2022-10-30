import { FsService } from '../fs/fs.service'
import { AuthService } from 'src/modules/auth/auth.service'
import { Module } from '@nestjs/common'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'

@Module({
  controllers: [DownloadController],
  providers: [DownloadService, AuthService, FsService],
})
export class DownloadModule {}
