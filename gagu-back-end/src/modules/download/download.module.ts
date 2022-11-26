import { Module } from '@nestjs/common'
import { DownloadController } from './download.controller'
import { FsModule } from '../fs/fs.module'
import { TunnelModule } from '../tunnel/tunnel.module'

@Module({
  imports: [FsModule, TunnelModule],
  controllers: [DownloadController],
})
export class DownloadModule {}
