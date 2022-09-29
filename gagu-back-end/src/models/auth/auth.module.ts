import { Module } from '@nestjs/common'
import { FsService } from '../fs/fs.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, FsService],
  exports: [AuthService],
})
export class AuthModule {}
