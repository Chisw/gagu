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
import { User, IUserForm, UserPermission, UserValidityType } from '../../types'
import {
  completeNestedPath,
  deleteEntry,
  GAGU_PATH,
  getIsExpired,
  PULSE_INTERVAL,
  SERVER_MESSAGE_MAP,
} from '../../utils'
import { FsService } from '../fs/fs.service'
import { Permission } from '../../common/decorators/permission.decorator'
import { AuthService } from '../auth/auth.service'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fsService: FsService,
  ) {}

  @Get()
  @Permission(UserPermission.administer)
  query() {
    const userList = this.userService.findAll()
    const authRecordList = this.authService.findAll()
    const loggedInList = authRecordList
      .filter((record) => record.timestamp > Date.now() - PULSE_INTERVAL)
      .map((record) => record.username)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: {
        userList,
        loggedInList,
      },
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
      completeNestedPath(`${GAGU_PATH.USERS}/${username}/desktop/_`)
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
    deleteEntry(`${GAGU_PATH.USERS}/${username}`)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Patch(':username/validity/:validity')
  @Permission(UserPermission.administer)
  updateValidity(
    @Param('username') username: User.Username,
    @Param('validity') validity: UserValidityType,
  ) {
    const isValid = validity === 'valid'
    this.userService.updateValidity(username, isValid)
    if (!isValid) {
      this.authService.removeUser(username)
    }
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }
}
