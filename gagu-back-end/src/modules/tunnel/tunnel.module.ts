import { Module } from '@nestjs/common'
import { TunnelController } from './tunnel.controller'
import { TunnelService } from './tunnel.service'
import { FsModule } from '../fs/fs.module'

@Module({
  imports: [FsModule],
  controllers: [TunnelController],
  providers: [TunnelService],
  exports: [TunnelService],
})
export class TunnelModule {}
