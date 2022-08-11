import {
  Controller,
  Post,
  Header,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common'
import * as md5 from 'md5'

const userMap: { [KEY: string]: string } = {
  chisw: md5('9293'),
}

@Controller('/api/login')
export class LoginController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    console.log(
      'API/ADD_DIRECTORY:',
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
