import { Controller, Post, Body, Get, Delete, Put, Param } from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { User, IUser } from 'src/types'
import { genToken } from 'src/utils'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
  ) {
    console.log('POST /AUTH/LOGIN', username)

    const user = this.authService.getUser(username)

    if (user) {
      if (user.password === password) {
        const token = genToken()
        this.authService.addLoggedInMap(token, username)

        return {
          success: true,
          token,
          msg: 'OK',
        }
      } else {
        return {
          success: false,
          msg: '密码错误',
        }
      }
    } else {
      return {
        success: false,
        msg: '用户不存在',
      }
    }
  }

  @Get('user')
  getUserList() {
    console.log('GET /AUTH/USER')

    const userList = this.authService.getUserList()
    return {
      success: true,
      rows: userList,
    }
  }

  @Post('user')
  addUser(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
  ) {
    console.log('POST /AUTH/USER')

    if (this.authService.getUser(username)) {
      return {
        success: false,
        msg: 'ERROR_USER_EXISTED',
      }
    } else {
      const newUser: IUser = {
        isAdmin: false,
        username,
        password,
        rootEntryList: [],
        permissionList: [],
        createdAt: Date.now(),
        expiredAt: Date.now() + 2 * 60 * 60 * 1000,
        isForbidden: false,
      }
      this.authService.addUser(newUser)
      return {
        success: true,
      }
    }
  }

  @Put('user')
  updateUser(@Body('user') user: IUser) {
    console.log('PUT /AUTH/USER')

    if (!this.authService.getUser(user.username)) {
      return {
        success: false,
        msg: 'ERROR_USER_NOT_EXISTED',
      }
    } else {
      this.authService.updateUser(user)
      return {
        success: true,
      }
    }
  }

  @Delete('user/:username')
  removeUser(@Param('username') username: User.Username) {
    console.log('DELETE /AUTH/USER', username)

    this.authService.removeUser(username)
    return {
      success: true,
    }
  }

  @Post('shutdown')
  shutdown() {
    console.log('POST /AUTH/SHUTDOWN')
    return process.exit(0)
  }
}
