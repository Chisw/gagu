import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  Param,
  Headers,
} from '@nestjs/common'
import { Public } from 'src/common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { User, IUser, UserStatus, IUserForm } from 'src/types'
import { dataURLtoBuffer, deleteEntry, GAGU_PATH, genToken } from 'src/utils'
import { FsService } from '../fs/fs.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fsService: FsService,
  ) {}

  @Get()
  getAuthData() {
    console.log('GET /AUTH')
    const userList = this.authService.getUserList()
    const loginMap = this.authService.getLoginMap()
    const loggedInUsernameList = Object.values(loginMap)
    return {
      success: true,
      userList,
      loggedInUsernameList,
    }
  }

  @Public()
  @Post('login')
  login(
    @Body('username') username: User.Username,
    @Body('password') password: User.Password,
  ) {
    console.log('POST /AUTH/LOGIN', username)

    const user = this.authService.findOne(username)

    if (user) {
      if (user.password === password) {
        const token = genToken()
        this.authService.addLoginRecord(token, username)

        return {
          success: true,
          token,
          msg: 'OK',
        }
      } else {
        return {
          success: false,
          msg: 'ERROR_PASSWORD_WRONG',
        }
      }
    } else {
      return {
        success: false,
        msg: 'ERROR_USER_NOT_EXISTED',
      }
    }
  }

  @Post('logout')
  logout(@Headers('Authorization') token: string) {
    console.log('POST /AUTH/LOGOUT')
    const username = this.authService.getLoginUsername(token)
    username && this.authService.removeLoginRecord(username)
    return {
      success: true,
    }
  }

  @Post('user')
  addUser(@Body() userFormData: IUserForm) {
    console.log('POST /AUTH/USER')

    const { avatar, nickname, username, password } = userFormData

    if (this.authService.findOne(username)) {
      return {
        success: false,
        msg: 'ERROR_USER_EXISTED',
      }
    } else {
      const avatarBuffer = dataURLtoBuffer(avatar)
      const avatarPath = `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
      avatarBuffer && this.fsService.uploadFile(avatarPath, avatarBuffer)

      const newUser: IUser = {
        nickname,
        username,
        password,
        status: UserStatus.normal,
        expiredAt: 0,
        permissionList: [],
        rootEntryPathList: [],
        isAdmin: false,
        createdAt: Date.now(),
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

    if (!this.authService.findOne(user.username)) {
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
    deleteEntry(`${GAGU_PATH.PUBLIC_AVATAR}/${username}`)

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
