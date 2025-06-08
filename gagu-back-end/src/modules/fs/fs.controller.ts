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
  getDuplicatedPath,
} from '../../utils'
import { FsService } from './fs.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
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
  ExistingStrategyType,
  ExistingStrategy,
  TransferResult,
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
  queryBaseData(@UserGetter() user: IUser) {
    const deviceName = this.settingService.findOne(SettingKey.deviceName)
    const {
      username,
      permissions,
      favoritePathList = [],
      assignedRootPathList = [],
    } = user

    const isAdmin = permissions.includes(UserPermission.administer)

    const rootEntryList = [
      ...(isAdmin ? this.fsService.getSystemRootEntryList() : []),

      ...assignedRootPathList.map((path) =>
        path2RootEntry(path, RootEntryGroup.server),
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
  queryEntryList(@Query('path') path: string) {
    const entryList = this.fsService.getEntryList(path)
    return respond(entryList)
  }

  @Post('list/flat')
  @Permission(UserPermission.read)
  @PathValidation({ bodyEntryListField: 'entryList' })
  queryFlatEntryList(@Body('entryList') entryList: IEntry[]) {
    const flatList = this.fsService.getRecursiveFlatEntryList(entryList)
    return respond(flatList)
  }

  @Get('exists')
  @PathValidation({ queryFields: ['path'] })
  queryExists(@Query('path') path: string) {
    const exists = getExists(path)
    return respond(exists)
  }

  @Post('exists')
  @PathValidation({ bodyFields: ['pathList'] })
  queryExistsCount(@Body('pathList') pathList: string[]) {
    const count = pathList.filter(getExists).length
    return respond(count)
  }

  @Get('size')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  queryDirectorySize(@Query('path') path: string) {
    const size = this.fsService.getDirectorySize(path)
    return respond(size)
  }

  @Get('text')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  queryTextContent(@Query('path') path: string) {
    const text = this.fsService.getTextContent(path)
    return respond(text)
  }

  @Get('exif-info')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  async queryExifInfo(@Query('path') path: string) {
    try {
      const data = await this.fsService.getExifInfo(path)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_EXIF)
    }
  }

  @Get('audio-info')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  async queryAudioInfo(@Query('path') path: string) {
    try {
      const data = await this.fsService.getAudioInfo(path)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_TAGS)
    }
  }

  @Post('directory')
  @Permission(UserPermission.write)
  @PathValidation({ bodyFields: ['path'] })
  createDirectory(@Body('path') path: string) {
    mkdirSync(path)
    return respond(TransferResult.created)
  }

  @Post('file')
  @Permission(UserPermission.write)
  @PathValidation({ queryFields: ['path'] })
  @UseInterceptors(FileInterceptor('file'))
  async createFile(
    @UserGetter() user: IUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('path') path: string,
    @Query('existingStrategy') existingStrategy?: ExistingStrategyType,
  ) {
    try {
      const isExisted = getExists(path)

      if (isExisted) {
        if (existingStrategy === ExistingStrategy.skip) {
          return respond(TransferResult.skipped)
        }

        if (!user.permissions.includes(UserPermission.delete)) {
          return respond(null, ServerMessage.ERROR_403_PERMISSION_DELETE)
        }

        if (existingStrategy === ExistingStrategy.replace) {
          await this.fsService.uploadFile(path, file.buffer)
          return respond(TransferResult.replaced)
        }

        if (existingStrategy === ExistingStrategy.keepBoth) {
          const duplicatedPath = getDuplicatedPath(path)
          await this.fsService.uploadFile(duplicatedPath, file.buffer)
          return respond(TransferResult.bothKept)
        }

        return respond(TransferResult.canceled)
      }

      await this.fsService.uploadFile(path, file.buffer)
      return respond(TransferResult.created)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }

  @Patch('entry')
  @Permission([UserPermission.write, UserPermission.delete])
  @PathValidation({ bodyFields: ['fromPath', 'toPath'] })
  renameEntry(
    @Body('fromPath') fromPath: string,
    @Body('toPath') toPath: string,
  ) {
    renameSync(fromPath, toPath)
    return respond()
  }

  @Put('entry')
  @Permission([UserPermission.write, UserPermission.delete])
  @PathValidation({ bodyFields: ['fromPath', 'toPath'] })
  async moveEntry(
    @UserGetter() user: IUser,
    @Body('fromPath') fromPath: string,
    @Body('toPath') toPath: string,
    @Query('existingStrategy') existingStrategy?: ExistingStrategyType,
  ) {
    try {
      const isExisted = getExists(toPath)

      if (isExisted) {
        if (existingStrategy === ExistingStrategy.skip) {
          return respond(TransferResult.skipped)
        }

        if (!user.permissions.includes(UserPermission.delete)) {
          return respond(null, ServerMessage.ERROR_403_PERMISSION_DELETE)
        }

        if (existingStrategy === ExistingStrategy.replace) {
          await this.fsService.moveEntry(fromPath, toPath)
          return respond(TransferResult.replaced)
        }

        if (existingStrategy === ExistingStrategy.keepBoth) {
          const duplicatedPath = getDuplicatedPath(toPath)
          await this.fsService.moveEntry(fromPath, duplicatedPath)
          return respond(TransferResult.bothKept)
        }

        return respond(TransferResult.canceled)
      }

      await this.fsService.moveEntry(fromPath, toPath)
      return respond(TransferResult.moved)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }

  @Post('entry')
  @Permission(UserPermission.write)
  @PathValidation({ bodyFields: ['fromPath', 'toPath'] })
  async copyEntry(
    @UserGetter() user: IUser,
    @Body('fromPath') fromPath: string,
    @Body('toPath') toPath: string,
    @Query('existingStrategy') existingStrategy?: ExistingStrategyType,
  ) {
    try {
      const isExisted = getExists(toPath)

      if (isExisted) {
        if (existingStrategy === ExistingStrategy.skip) {
          return respond(TransferResult.skipped)
        }

        if (!user.permissions.includes(UserPermission.delete)) {
          return respond(null, ServerMessage.ERROR_403_PERMISSION_DELETE)
        }

        if (existingStrategy === ExistingStrategy.replace) {
          await this.fsService.copyEntry(fromPath, toPath)
          return respond(TransferResult.replaced)
        }

        if (existingStrategy === ExistingStrategy.keepBoth) {
          const duplicatedPath = getDuplicatedPath(toPath)
          await this.fsService.copyEntry(fromPath, duplicatedPath)
          return respond(TransferResult.bothKept)
        }

        return respond(TransferResult.canceled)
      }

      await this.fsService.copyEntry(fromPath, toPath)
      return respond(TransferResult.copied)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }

  @Delete('entry')
  @Permission(UserPermission.delete)
  @PathValidation({ queryFields: ['path'] })
  async deleteEntry(@Query('path') path: string) {
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

  @Post('favorite')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  createFavorite(@Query('path') path: string, @UserGetter() user: IUser) {
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

  @Post('public/image/:name')
  @Permission(UserPermission.administer)
  @UseInterceptors(FileInterceptor('file'))
  createPublicImage(
    @Param('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.fsService.createPublicImage(name, file.buffer)
      return respond()
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_CATCHER_CAUGHT)
    }
  }

  @Get('thumbnail')
  @Permission(UserPermission.read)
  @Header('Content-Type', 'image/jpg')
  @PathValidation({ queryFields: ['path'] })
  async getThumbnailStreamUrl(
    @Query('path') path: string,
    @Res() response: Response,
  ) {
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

  @Get('stream')
  @Permission(UserPermission.read)
  @PathValidation({ queryFields: ['path'] })
  getPathStreamUrl(@Query('path') path: string, @Res() response: Response) {
    response.sendFile(path)
  }

  @Public()
  @Get('public/avatar/:username')
  @Header('Content-Type', 'image/jpg')
  getPublicAvatarStreamUrl(
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
  getPublicImageStreamUrl(
    @Param('name') name: User.Username,
    @Res() response: Response,
  ) {
    const path = this.fsService.getImagePath(name)
    if (getExists(path)) {
      response.sendFile(path)
    } else {
      response.end(
        JSON.stringify(respond(null, ServerMessage.ERROR_FILE_NOT_EXISTED)),
      )
    }
  }
}
