import { AuthService } from 'src/models/auth/auth.service'
import { Module } from '@nestjs/common'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'

@Module({
  controllers: [DownloadController],
  providers: [DownloadService, AuthService],
})
export class DownloadModule {}
