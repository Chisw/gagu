import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AuthService } from '../auth/auth.service'
import { FsService } from '../fs/fs.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [FsService, UserService],
  exports: [UserService],
})
export class UserModule { }
