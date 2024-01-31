import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  Put,
} from '@nestjs/common'
import { UserService } from './user.service'
import {
  User,
  IUserForm,
  UserPermission,
  UserValidityType,
  ServerMessage,
  UserPasswordForm,
} from '../../types'
import {
  removeEntry,
  GAGU_PATH,
  getIsExpired,
  initUserPaths,
  respond,
} from '../../utils'
import { FsService } from '../fs/fs.service'
import { Permission } from '../../common/decorators'
import { AuthService } from '../auth/auth.service'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fsService: FsService,
  ) {
    const users = userService.findAll()
    users.forEach(({ username }) => initUserPaths(username))
  }

  @Get()
  @Permission(UserPermission.administer)
  queryUserList() {
    const userList = this.userService.findAll()
    const authRecordList = this.authService.findAll()

    userList.forEach((user) => {
      const sortedList = authRecordList
        .filter(({ username, pulsedAt }) => {
          return username === user.username && pulsedAt
        })
        .sort((a, b) => (a.pulsedAt > b.pulsedAt ? -1 : 1))

      user.pulsedAt = sortedList[0]?.pulsedAt
    })

    return respond(userList)
  }

  @Post()
  @Permission(UserPermission.administer)
  createUser(@Body() userForm: IUserForm) {
    const { avatar, username } = userForm
    if (this.userService.findOne(username)) {
      return respond(null, ServerMessage.ERROR_USER_EXISTED)
    } else {
      this.fsService.uploadAvatar(username, avatar)
      this.userService.create(userForm)
      initUserPaths(username)
      return respond()
    }
  }

  @Patch()
  @Permission(UserPermission.administer)
  updateUser(@Body() userForm: IUserForm) {
    const { avatar, username, password } = userForm
    if (this.userService.findOne(username)) {
      if (password || getIsExpired(userForm.expiredAt)) {
        this.authService.removeUserAllRecords(username)
      }
      this.fsService.uploadAvatar(username, avatar)
      this.userService.update(userForm)
      return respond()
    } else {
      return respond(null, ServerMessage.ERROR_USER_NOT_EXISTED)
    }
  }

  @Delete(':username')
  @Permission(UserPermission.administer)
  async deleteUser(@Param('username') username: User.Username) {
    this.userService.remove(username)
    this.authService.removeUserAllRecords(username)
    await removeEntry(`${GAGU_PATH.PUBLIC_AVATAR}/${username}`)
    await removeEntry(`${GAGU_PATH.USERS}/${username}`)
    return respond()
  }

  @Put(':username/password')
  @Permission(UserPermission.read)
  updateUserPassword(
    @Param('username') username: User.Username,
    @Body() userPasswordForm: UserPasswordForm,
  ) {
    const user = this.userService.findOne(username)
    if (user) {
      if (user.passwordLocked) {
        return respond(null, ServerMessage.ERROR_PASSWORD_LOCKED)
      }
      const { password, newPassword } = userPasswordForm
      if (password === user.password) {
        this.userService.updatePassword(username, newPassword)
        this.authService.removeUserAllRecords(username)
        return respond()
      } else {
        return respond(null, ServerMessage.ERROR_PASSWORD_WRONG)
      }
    } else {
      return respond(null, ServerMessage.ERROR_USER_NOT_EXISTED)
    }
  }

  @Patch(':username/validity/:validity')
  @Permission(UserPermission.administer)
  updateUserValidity(
    @Param('username') username: User.Username,
    @Param('validity') validity: UserValidityType,
  ) {
    const isValid = validity === 'valid'
    this.userService.updateValidity(username, isValid)
    if (!isValid) {
      this.authService.removeUserAllRecords(username)
    }
    return respond()
  }
}
