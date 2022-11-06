import { Controller, Post, Body, Headers, Get } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { User, UserPermission } from '../../types'
import {
  genHashCode,
  genUserInfo,
  SERVER_MESSAGE_MAP,
  HEADERS_AUTH_KEY,
  getIsExpired,
} from '../../utils'
import { UserService } from '../user/user.service'
import { Permission } from '../../common/decorators/permission.decorator'

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
        const token = genHashCode()
        this.authService.create(token, username)
        if (disabled) {
          return {
            success: false,
            message: SERVER_MESSAGE_MAP.ERROR_USER_DISABLED,
          }
        } else {
          if (getIsExpired(user.expiredAt)) {
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
  pulse(@Headers(HEADERS_AUTH_KEY) token: User.Token) {
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
  logout(@Headers(HEADERS_AUTH_KEY) token: User.Token) {
    this.authService.remove(token)
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
