import { Controller, Post, Body, Get } from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import * as md5 from 'md5'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    console.log('AUTH/LOGIN:', ' username: ', username)

    const user = this.authService.getUser(username)

    if (user) {
      if (user.password === password) {
        return {
          success: true,
          authorization: md5(Math.random().toString()),
          msg: 'OK',
        }
      } else {
        return {
          success: false,
          authCode: '',
          msg: '密码错误',
        }
      }
    } else {
      return {
        success: false,
        authCode: '',
        msg: '用户不存在',
      }
    }
  }

  @Get('users')
  getUserList() {
    const userList = this.authService.getUserList()
    return {
      success: true,
      rows: userList,
    }
  }

  @Post('shutdown')
  shutdown() {
    console.log('AUTH/SHUTDOWN')
    return process.exit(0)
  }
}
