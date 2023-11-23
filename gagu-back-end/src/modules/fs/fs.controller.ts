import { SettingService } from './../setting/setting.service'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  deleteEntry,
  ServerOS,
  getExists,
  SERVER_MESSAGE_MAP,
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
} from '../../types'
import { mkdirSync, renameSync } from 'fs'
import { Permission } from '../../common/decorators/permission.decorator'
import { Public } from 'src/common/decorators/public.decorator'
import { UserGetter } from 'src/common/decorators/user.decorator'
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
  getRoot(@UserGetter() user: IUser) {
    const deviceName = this.settingService.findOne(SettingKey.deviceName)
    const baseData: IBaseData = {
      ...this.fsService.getBaseData(deviceName),
      favoritePathList: user.favoritePathList,
    }
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: baseData,
    }
  }

  @Get('list')
  @Permission(UserPermission.read)
  findAll(@Query('path') path: string) {
    const entryList = this.fsService.getEntryList(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: entryList,
    }
  }

  @Post('list/flatten')
  @Permission(UserPermission.read)
  findFlattenAll(@Body('entryList') entryList: IEntry[]) {
    const flattenList = this.fsService.getFlattenRecursiveEntryList(entryList)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      flattenList,
    }
  }

  @Get('exists')
  readExists(@Query('path') path: string) {
    const exists = getExists(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      exists,
    }
  }

  @Get('size')
  @Permission(UserPermission.read)
  readSize(@Query('path') path: string) {
    const size = this.fsService.getDirectorySize(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: size,
    }
  }

  @Get('text')
  @Permission(UserPermission.read)
  readTextContent(@Query('path') path: string) {
    const data = this.fsService.getTextContent(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data,
    }
  }

  @Put('rename')
  @Permission(UserPermission.write)
  update(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    renameSync(oldPath, newPath)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Post('mkdir')
  @Permission(UserPermission.write)
  create(@Body('path') path: string) {
    mkdirSync(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Delete('delete')
  @Permission(UserPermission.delete)
  remove(@Query('path') path: string) {
    deleteEntry(path)
    this.userService.removeAllUsersFavorite(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Get('thumbnail')
  @Permission(UserPermission.read)
  @Header('Content-Type', 'image/jpg')
  async readThumbnail(@Query('path') path: string, @Res() response: Response) {
    if (ServerOS.supportThumbnail) {
      try {
        const filePath = await this.fsService.getThumbnailPath(path)
        response.sendFile(filePath)
      } catch (err) {
        response.end(`ERROR: ${err}`)
      }
    } else {
      response.end('ERROR: FFMPEG and GM are required.')
    }
  }

  @Public()
  @Get('avatar/:username')
  @Header('Content-Type', 'image/jpg')
  readAvatar(
    @Param('username') username: User.Username,
    @Res() response: Response,
  ) {
    try {
      const avatarPath = this.fsService.getAvatarPath(username)
      if (getExists(avatarPath)) {
        response.sendFile(avatarPath)
      } else {
        response.end('ERROR_AVATAR_NOT_EXISTED')
      }
    } catch (err) {
      response.end('ERROR_AVATAR')
    }
  }

  @Public()
  @Get('image/:name')
  @Header('Content-Type', 'image/jpg')
  readImage(@Param('name') name: User.Username, @Res() response: Response) {
    try {
      const path = this.fsService.getImagePath(name)
      if (getExists(path)) {
        response.sendFile(path)
      } else {
        response.end('ERROR_IMAGE_NOT_EXISTED')
      }
    } catch (err) {
      response.end('ERROR_IMAGE')
    }
  }

  @Get('exif')
  @Permission(UserPermission.read)
  async getExif(@Query('path') path: string) {
    try {
      const data = await this.fsService.getExif(path)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        data,
      }
    } catch (err) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_EXIF,
      }
    }
  }

  @Get('audio-tags')
  @Permission(UserPermission.read)
  async getAudioTags(@Query('path') path: string) {
    try {
      const data = await this.fsService.getAudioTags(path)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        data,
      }
    } catch (err) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TAGS,
      }
    }
  }

  @Get('stream')
  @Permission(UserPermission.read)
  readStream(@Query('path') path: string, @Res() response: Response) {
    response.sendFile(path)
  }

  @Post('upload')
  @Permission(UserPermission.write)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
    @UserGetter() user: IUser,
  ) {
    if (getExists(path) && !user.permissions.includes(UserPermission.delete)) {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_403,
      }
    }
    try {
      this.fsService.uploadFile(path, file.buffer)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    } catch (err) {
      return {
        success: false,
        message: err.toString(),
      }
    }
  }

  @Post('upload/image/:name')
  @Permission(UserPermission.administer)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.fsService.uploadImage(name, file.buffer)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    } catch (err) {
      return {
        success: false,
        message: err.toString(),
      }
    }
  }

  @Post('favorite')
  @Permission(UserPermission.read)
  updateFavorite(
    @Query('path') path: string,
    @UserGetter() user: IUser,
  ) {
    const list = this.userService.createFavorite(user.username, path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      list,
    }
  }

  @Delete('favorite')
  @Permission(UserPermission.read)
  removeFavorite(
    @Query('path') path: string,
    @UserGetter() user: IUser,
  ) {
    const list = this.userService.removeFavorite(user.username, path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      list,
    }
  }
}
