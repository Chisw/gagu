import { Controller, Post, Body, Headers, Get } from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { User, UserPermission } from 'src/types'
import {
  genToken,
  getIsExpired,
  genUserInfo,
  SERVER_MESSAGE_MAP,
} from 'src/utils'
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
      const { disabled } = user
      if (password === user.password) {
        const token = genToken()
        this.authService.create(token, username)
        if (disabled) {
          return {
            success: false,
            message: SERVER_MESSAGE_MAP.ERROR_USER_DISABLED,
          }
        } else {
          if (getIsExpired(user)) {
            return {
              success: false,
              message: SERVER_MESSAGE_MAP.ERROR_USER_EXPIRED,
            }
          } else {
            return {
              success: true,
              message: SERVER_MESSAGE_MAP.OK,
              userInfo: genUserInfo(user, token),
            }
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

  @Get('pulse')
  pulse(@Headers('Authorization') token: User.Token) {
    const username = this.authService.findOneUsername(token)
    if (username) {
      const user = this.userService.findOne(username)
      if (user) {
        this.authService.update(token)
        return {
          success: true,
          message: SERVER_MESSAGE_MAP.OK,
          userInfo: genUserInfo(user, token),
        }
      } else {
        return {
          success: false,
          message: SERVER_MESSAGE_MAP.ERROR_USER_NOT_EXISTED,
        }
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TOKEN_INVALID,
      }
    }
  }

  @Post('logout')
  logout(@Headers('Authorization') token: User.Token) {
    this.authService.removeOne(token)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Post('shutdown')
  @Permission(UserPermission.administer)
  shutdown() {
    this.authService.removeAll()
    return process.exit(0)
  }
}
