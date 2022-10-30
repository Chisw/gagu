import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User, IUserForm, UserPermission, UserAbilityType } from 'src/types'
import {
  deleteEntry,
  GAGU_PATH,
  getIsExpired,
  PULSE_INTERVAL,
  SERVER_MESSAGE_MAP,
} from 'src/utils'
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
    const authRecordList = this.authService.findAll()
    const loggedInList = authRecordList
      .filter((record) => record.timestamp > Date.now() - PULSE_INTERVAL)
      .map((record) => record.username)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      userList,
      loggedInList,
    }
  }

  @Post()
  @Permission(UserPermission.administer)
  create(@Body() userForm: IUserForm) {
    const { avatar, username } = userForm
    if (this.userService.findOne(username)) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_USER_EXISTED,
      }
    } else {
      this.fsService.uploadAvatar(username, avatar)
      this.userService.create(userForm)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    }
  }

  @Patch()
  @Permission(UserPermission.administer)
  update(@Body() userForm: IUserForm) {
    const { avatar, username, password } = userForm
    if (!this.userService.findOne(username)) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_USER_NOT_EXISTED,
      }
    } else {
      if (password || getIsExpired(userForm.expiredAt)) {
        this.authService.removeUser(username)
      }
      this.fsService.uploadAvatar(username, avatar)
      this.userService.update(userForm)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    }
  }

  @Delete(':username')
  @Permission(UserPermission.administer)
  remove(@Param('username') username: User.Username) {
    this.userService.remove(username)
    this.authService.removeUser(username)
    deleteEntry(`${GAGU_PATH.PUBLIC_AVATAR}/${username}`)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Post(':username/:ability')
  @Permission(UserPermission.administer)
  enable(
    @Param('username') username: User.Username,
    @Param('ability') ability: UserAbilityType,
  ) {
    const isEnable = ability === 'enable'
    this.userService.updateAbility(username, isEnable)
    if (!isEnable) {
      this.authService.removeUser(username)
    }
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }
}
