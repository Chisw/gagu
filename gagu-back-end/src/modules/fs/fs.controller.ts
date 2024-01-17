import { SettingService } from './../setting/setting.service'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  removeEntry,
  ServerOS,
  getExists,
  GAGU_VERSION,
  path2RootEntry,
  respond,
  catchError,
  GAGU_PATH,
} from '../../utils'
import { FsService } from './fs.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import {
  IEntry,
  IBaseData,
  IUser,
  SettingKey,
  User,
  UserPermission,
  ServerMessage,
  RootEntryGroup,
} from '../../types'
import { mkdirSync, renameSync } from 'fs'
import {
  PathValidation,
  Permission,
  Public,
  UserGetter,
} from '../../common/decorators'
import { UserService } from '../user/user.service'
import 'express-zip'

@Controller('fs')
export class FsController {
  constructor(
    private readonly fsService: FsService,
    private readonly userService: UserService,
    private readonly settingService: SettingService,
  ) {}

  @Get('base-data')
  @Permission(UserPermission.read)
  getBaseData(@UserGetter() user: IUser) {
    const deviceName = this.settingService.findOne(SettingKey.deviceName)
    const {
      username,
      permissions,
      favoritePathList = [],
      assignedRootPathList = [],
    } = user

    const isAdmin = permissions.includes(UserPermission.administer)

    const rootEntryList = [
      ...(isAdmin ? this.fsService.getRootEntryList() : []),
      ...assignedRootPathList.map((path) =>
        path2RootEntry(path, RootEntryGroup.system),
      ),
      path2RootEntry(`${GAGU_PATH.USERS}/${username}`, RootEntryGroup.user),
      ...favoritePathList.map((path) =>
        path2RootEntry(path, RootEntryGroup.favorite),
      ),
    ]

    const baseData: IBaseData = {
      version: GAGU_VERSION,
      serverOS: ServerOS,
      deviceName: deviceName || ServerOS.hostname,
      rootEntryList,
    }

    return respond(baseData)
  }

  @Get('list')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  findAll(@Query('path') path: string) {
    const entryList = this.fsService.getEntryList(path)
    return respond(entryList)
  }

  @Post('list/flat')
  @Permission(UserPermission.read)
  @PathValidation({ bodyEntryListField: 'entryList' })
  findFlattenAll(@Body('entryList') entryList: IEntry[]) {
    const flattenList = this.fsService.getRecursiveFlattenEntryList(entryList)
    return respond(flattenList)
  }

  @Get('exists')
  @PathValidation({ queryFields: ['path'] })
  readExists(@Query('path') path: string) {
    const exists = getExists(path)
    return respond(exists)
  }

  @Get('size')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  readSize(@Query('path') path: string) {
    const size = this.fsService.getDirectorySize(path)
    return respond(size)
  }

  @Get('text')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  readTextContent(@Query('path') path: string) {
    const text = this.fsService.getTextContent(path)
    return respond(text)
  }

  @Put('rename')
  @Permission(UserPermission.write)
  @PathValidation({ bodyFields: ['oldPath', 'newPath'] })
  updateName(
    @Body('oldPath') oldPath: string,
    @Body('newPath') newPath: string,
  ) {
    // TODO:
    renameSync(oldPath, newPath)
    return respond()
  }

  @Put('move')
  @Permission([UserPermission.write, UserPermission.delete])
  @PathValidation({ bodyFields: ['oldPath', 'newPath'] })
  async updatePath(
    @Body('oldPath') oldPath: string,
    @Body('newPath') newPath: string,
  ) {
    await this.fsService.moveEntry(oldPath, newPath)
    return respond()
  }

  @Post('mkdir')
  @Permission(UserPermission.write)
  @PathValidation({ bodyFields: ['path'] })
  create(@Body('path') path: string) {
    mkdirSync(path)
    return respond()
  }

  @Delete('delete')
  @Permission(UserPermission.delete)
  @PathValidation({ queryFields: ['path'] })
  async remove(@Query('path') path: string) {
    const isExisted = getExists(path)
    if (!isExisted) {
      return respond()
    }
    await removeEntry(path)
    const deleted = !getExists(path)
    if (deleted) {
      this.userService.removeFavoriteOfAllUsers(path)
      return respond()
    } else {
      return respond(null, ServerMessage.ERROR_FILE_DELETE_FAIL)
    }
  }

  @Get('thumbnail')
  @Permission(UserPermission.read)
  @Header('Content-Type', 'image/jpg')
  @PathValidation({ queryFields: ['path'] })
  async readThumbnail(@Query('path') path: string, @Res() response: Response) {
    if (ServerOS.supportThumbnail) {
      try {
        const filePath = await this.fsService.getThumbnailPath(path)
        if (filePath) {
          response.sendFile(filePath)
        } else {
          response.end(
            JSON.stringify(respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)),
          )
        }
      } catch (error) {
        catchError(error)
        response.end(
          JSON.stringify(respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)),
        )
      }
    } else {
      response.end(
        JSON.stringify(
          respond(null, ServerMessage.ERROR_NOT_SUPPORT_THUMBNAIL),
        ),
      )
    }
  }

  @Get('exif')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  async getExif(@Query('path') path: string) {
    try {
      const data = await this.fsService.getExif(path)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_EXIF)
    }
  }

  @Get('audio-tags')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  async getAudioTags(@Query('path') path: string) {
    try {
      const data = await this.fsService.getAudioTags(path)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_TAGS)
    }
  }

  @Get('stream')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  readStream(@Query('path') path: string, @Res() response: Response) {
    response.sendFile(path)
  }

  @Post('upload')
  @Permission(UserPermission.write)
  @PathValidation({ queryFields: ['path'] })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
    @UserGetter() user: IUser,
  ) {
    if (getExists(path) && !user.permissions.includes(UserPermission.delete)) {
      return respond(null, ServerMessage.ERROR_403_PERMISSION_DELETE)
    }
    try {
      await this.fsService.uploadFile(path, file.buffer)
      return respond()
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }

  @Post('favorite')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  updateFavorite(@Query('path') path: string, @UserGetter() user: IUser) {
    const pathList = this.userService.createFavorite(user.username, path)
    return respond(
      pathList.map((path) => path2RootEntry(path, RootEntryGroup.favorite)),
    )
  }

  @Delete('favorite')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  removeFavorite(@Query('path') path: string, @UserGetter() user: IUser) {
    const pathList = this.userService.removeFavorite(user.username, path)
    return respond(
      pathList.map((path) => path2RootEntry(path, RootEntryGroup.favorite)),
    )
  }

  @Public()
  @Get('public/avatar/:username')
  @Header('Content-Type', 'image/jpg')
  readAvatar(
    @Param('username') username: User.Username,
    @Res() response: Response,
  ) {
    const avatarPath = this.fsService.getAvatarPath(username)
    if (getExists(avatarPath)) {
      response.sendFile(avatarPath)
    } else {
      response.end(
        JSON.stringify(respond(null, ServerMessage.ERROR_FILE_NOT_EXISTED)),
      )
    }
  }

  @Public()
  @Get('public/image/:name')
  @Header('Content-Type', 'image/jpg')
  readImage(@Param('name') name: User.Username, @Res() response: Response) {
    const path = this.fsService.getImagePath(name)
    if (getExists(path)) {
      response.sendFile(path)
    } else {
      response.end(
        JSON.stringify(respond(null, ServerMessage.ERROR_FILE_NOT_EXISTED)),
      )
    }
  }

  @Post('public/image/:name')
  @Permission(UserPermission.administer)
  @UseInterceptors(FileInterceptor('file'))
  uploadPublicImage(
    @Param('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.fsService.uploadPublicImage(name, file.buffer)
      return respond()
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }
}
