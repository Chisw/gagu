import { SettingService } from './../setting/setting.service'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  deleteEntry,
  DEPENDENCIES_MAP,
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
  IRootInfo,
  IUser,
  SettingKey,
  User,
  UserPermission,
} from '../../types'
import { mkdirSync, renameSync } from 'fs'
import { Permission } from '../../common/decorators/permission.decorator'
import { Public } from 'src/common/decorators/public.decorator'
import 'express-zip'
import { UserGetter } from 'src/common/decorators/user.decorator'

@Controller('fs')
export class FsController {
  constructor(
    private readonly fsService: FsService,
    private readonly settingService: SettingService,
  ) {}

  @Get('root')
  @Permission(UserPermission.read)
  getRoot(@UserGetter() user: IUser) {
    const deviceName = this.settingService.findOne(SettingKey.deviceName)
    const rootInfo: IRootInfo = {
      ...this.fsService.getRootInfo(deviceName),
      favoritePathList: user.favoritePathList,
    }
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: rootInfo,
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
    const textContent = this.fsService.getTextContent(path)
    return textContent
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
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }

  @Get('thumbnail')
  @Permission(UserPermission.read)
  @Header('Content-Type', 'image/jpg')
  async readThumbnail(@Query('path') path: string, @Res() response: Response) {
    if (DEPENDENCIES_MAP.ffmpeg && DEPENDENCIES_MAP.gm) {
      try {
        const filePath = await this.fsService.getThumbnailPath(path)
        response.sendFile(filePath)
      } catch (err) {
        response.end(`ERROR: ${err}`)
      }
    } else {
      response.end('FFMPEG and GM are required.')
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
      return data
    } catch (err) {
      console.log('ERR: EXIF')
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
      return data
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
  ) {
    return this.fsService.uploadFile(path, file.buffer)
  }

  @Post('upload/image/:name')
  @Permission(UserPermission.administer)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fsService.uploadImage(name, file.buffer)
  }
}
