import { Controller, Post, Body } from '@nestjs/common'
import { Public, readUserListData } from '../utils'
import * as md5 from 'md5'

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    console.log('AUTH/LOGIN:', ' username: ', username)

    const { userList } = readUserListData()
    const user = userList.find((u) => u.username === username)

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

  @Post('shutdown')
  shutdown() {
    console.log('AUTH/SHUTDOWN')
    return process.exit(0)
  }
}
