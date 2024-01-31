import {
  Controller,
  Delete,
  Post,
  Body,
  Put,
  Headers,
  Request,
} from '@nestjs/common'
import { Public } from '../../common/decorators'
import { AuthService } from './auth.service'
import { ServerMessage, User } from '../../types'
import {
  HEADERS_AUTH_KEY,
  getIsExpired,
  getAuthorizationToken,
  respond,
} from '../../utils'
import { UserService } from '../user/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('token')
  login(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
    @Request() request: any,
  ) {
    const user = this.userService.findOne(username)
    if (user) {
      if (password === user.password) {
        const { invalid } = user
        if (invalid) {
          return respond(null, ServerMessage.ERROR_USER_DISABLED)
        } else {
          if (getIsExpired(user.expiredAt)) {
            return respond(null, ServerMessage.ERROR_USER_EXPIRED)
          } else {
            const userInfo = this.authService.create(user, request)
            return respond(userInfo)
          }
        }
      } else {
        return respond(null, ServerMessage.ERROR_PASSWORD_WRONG)
      }
    } else {
      return respond(null, ServerMessage.ERROR_USER_NOT_EXISTED)
    }
  }

  @Delete('token')
  logout(@Headers(HEADERS_AUTH_KEY) authorization: string) {
    const token = getAuthorizationToken(authorization)
    this.authService.remove(token)
    return respond()
  }

  @Put('access-token')
  updateAccess(@Headers(HEADERS_AUTH_KEY) authorization: string) {
    const token = getAuthorizationToken(authorization)
    const accessToken = this.authService.updateAccessToken(token)
    return respond(accessToken)
  }
}
