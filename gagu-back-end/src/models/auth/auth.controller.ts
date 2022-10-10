import { Controller, Post, Body, Headers } from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { User, UserPermission } from 'src/types'
import { genToken, SERVER_MESSAGE_MAP } from 'src/utils'
import { UserService } from '../user/user.service'
import { Permission } from 'src/common/decorators/permission.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  login(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
  ) {
    const user = this.userService.findOne(username)
    if (user) {
      if (password === user.password) {
        const token = genToken()
        this.authService.create(token, username)
        if (user.disabled) {
          return {
            success: false,
            message: SERVER_MESSAGE_MAP.ERROR_USER_DISABLED,
          }
        } else {
          return {
            success: true,
            message: SERVER_MESSAGE_MAP.OK,
            token,
          }
        }
      } else {
        return {
          success: false,
          message: SERVER_MESSAGE_MAP.ERROR_PASSWORD_WRONG,
        }
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_USER_NOT_EXISTED,
      }
    }
  }

  @Post('logout')
  logout(@Headers('Authorization') token: User.Token) {
    this.authService.remove(token)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Post('shutdown')
  @Permission(UserPermission.administer)
  shutdown() {
    return process.exit(0)
  }
}
