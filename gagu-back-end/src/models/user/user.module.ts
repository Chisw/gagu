import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { FsService } from '../fs/fs.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [FsService, UserService],
  exports: [UserService],
})
export class UserModule {}
