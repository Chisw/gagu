import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  Param,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User, IUser, IUserForm, UserPermission } from 'src/types'
import { dataURLtoBuffer, deleteEntry, GAGU_PATH } from 'src/utils'
import { FsService } from '../fs/fs.service'
import { Permission } from 'src/common/decorators/permission.decorator'
import { AuthService } from '../auth/auth.service'

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly fsService: FsService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @Permission(UserPermission.administer)
  getData() {
    const userList = this.userService.findAll()
    const loginMap = this.authService.findAll()
    const loggedIn = Object.values(loginMap)
    return {
      success: true,
      userList,
      loggedIn,
    }
  }

  @Post()
  @Permission(UserPermission.administer)
  create(@Body() userFormData: IUserForm) {
    const { avatar, nickname, username, password } = userFormData

    if (this.userService.findOne(username)) {
      return {
        success: false,
        message: 'ERROR_USER_EXISTED',
      }
    } else {
      const avatarBuffer = dataURLtoBuffer(avatar)
      const avatarPath = `${GAGU_PATH.PUBLIC_AVATAR}/${username}`
      avatarBuffer && this.fsService.uploadFile(avatarPath, avatarBuffer)

      const newUser: IUser = {
        nickname,
        username,
        password,
        disabled: false,
        createdAt: Date.now(),
        expiredAt: 0,
        permissionList: [],
        rootEntryPathList: [],
      }
      this.userService.create(newUser)
      return {
        success: true,
      }
    }
  }

  @Put()
  @Permission(UserPermission.administer)
  update(@Body('user') userForm: IUserForm) {
    if (!this.userService.findOne(userForm.username)) {
      return {
        success: false,
        message: 'ERROR_USER_NOT_EXISTED',
      }
    } else {
      this.userService.update(userForm)
      return {
        success: true,
      }
    }
  }

  @Delete(':username')
  @Permission(UserPermission.administer)
  remove(@Param('username') username: User.Username) {
    this.userService.remove(username)
    this.authService.remove(username)
    deleteEntry(`${GAGU_PATH.PUBLIC_AVATAR}/${username}`)
    return {
      success: true,
    }
  }
}
