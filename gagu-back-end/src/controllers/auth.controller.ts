import {
  Controller,
  Post,
  Body,
} from '@nestjs/common'
import * as md5 from 'md5'
import { Public } from '../utils/api.decorator'

const userMap: { [KEY: string]: string } = {
  gagu: md5('9293'),
}

@Controller('/auth')
export class AuthController {
  @Public()
  @Post('login')
  findAll(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    console.log(
      'API/AUTH/LOGIN:',
      ' username: ',
      username,
      'password',
      password,
    )
    const userName = username.toLowerCase()
    const passwordRecord = userMap[userName]
    const success = passwordRecord === password

    return {
      success,
      authCode: success
        ? Math.random().toString(36).slice(-8).toUpperCase()
        : '',
      msg: success
        ? 'OK'
        : passwordRecord === undefined
          ? '用户不存在'
          : '密码错误',
    }
  }
}
