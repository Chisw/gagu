import { Module } from '@nestjs/common'
import { CommonModule } from './common/common.module'
import { AuthModule } from './models/auth/auth.module'
import { FsModule } from './models/fs/fs.module'

@Module({
  imports: [CommonModule, AuthModule, FsModule],
})
export class AppModule {}
