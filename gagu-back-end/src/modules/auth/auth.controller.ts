import { Controller, Post, Body, Headers, Get } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { ServerMessage, User, UserPermission } from '../../types'
import {
  generateRandomCode,
  generateUserInfo,
  HEADERS_AUTH_KEY,
  getIsExpired,
  getAuthorizationToken,
  respond,
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
      const { invalid } = user
      if (password === user.password) {
        const token = Buffer.from(generateRandomCode()).toString('base64')
        this.authService.create(token, username)
        if (invalid) {
          return respond(null, ServerMessage.ERROR_USER_DISABLED)
        } else {
          if (getIsExpired(user.expiredAt)) {
            return respond(null, ServerMessage.ERROR_USER_EXPIRED)
          } else {
            return respond(generateUserInfo(user, token))
          }
        }
      } else {
        return respond(null, ServerMessage.ERROR_PASSWORD_WRONG)
      }
    } else {
      return respond(null, ServerMessage.ERROR_USER_NOT_EXISTED)
    }
  }

  @Get('pulse')
  pulse(@Headers(HEADERS_AUTH_KEY) authorization: string) {
    const token = getAuthorizationToken(authorization)
    const username = this.authService.findOneUsername(token)
    if (username) {
      const user = this.userService.findOne(username)
      if (user) {
        this.authService.update(token)
        return respond(generateUserInfo(user, token))
      } else {
        return respond(null, ServerMessage.ERROR_USER_NOT_EXISTED)
      }
    } else {
      return respond(null, ServerMessage.ERROR_TOKEN_INVALID)
    }
  }

  @Post('logout')
  logout(@Headers(HEADERS_AUTH_KEY) authorization: string) {
    const token = getAuthorizationToken(authorization)
    this.authService.remove(token)
    return respond()
  }

  @Post('shutdown')
  @Permission(UserPermission.administer)
  shutdown() {
    setTimeout(() => process.exit(0), 1000)
    return respond()
  }
}
