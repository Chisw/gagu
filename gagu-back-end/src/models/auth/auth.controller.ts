import { Controller, Post, Body, Get } from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import * as md5 from 'md5'
import { AuthService } from './auth.service'
import { User, IUser } from 'src/types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
  ) {
    console.log('AUTH/LOGIN:', ' username: ', username)

    const user = this.authService.getUser(username)

    if (user) {
      if (user.password === password) {
        const authorization = md5(Math.random().toString())
        this.authService.addLoggedInMap(authorization, username)
        console.log(this.authService.getLoggedInMap())
        return {
          success: true,
          authorization,
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

  @Post('user')
  addUser(@Body('user') user: IUser) {
    this.authService.addUser(user)
    return {
      success: true,
    }
  }

  @Post('shutdown')
  shutdown() {
    console.log('AUTH/SHUTDOWN')
    return process.exit(0)
  }
}
