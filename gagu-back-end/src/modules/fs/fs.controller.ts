import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { deleteEntry, getExists, SERVER_MESSAGE_MAP } from '../../utils'
import { FsService } from './fs.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { User, UserPermission } from '../../types'
import { mkdirSync, renameSync } from 'fs'
import { Permission } from '../../common/decorators/permission.decorator'
import 'express-zip'

@Controller('fs')
export class FsController {
  constructor(private readonly fsService: FsService) {}

  @Get('root')
  @Permission(UserPermission.read)
  getRoot() {
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      rootInfo: this.fsService.getRootInfo(),
    }
  }

  @Get('list')
  @Permission(UserPermission.read)
  findAll(@Query('path') path: string) {
    const entryList = this.fsService.getEntryList(path)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      entryList,
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
      size,
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
    try {
      const filePath = await this.fsService.getThumbnailPath(path)
      response.sendFile(filePath)
    } catch (err) {
      response.end('ERROR')
    }
  }

  @Get('avatar')
  @Permission(UserPermission.read)
  @Header('Content-Type', 'image/jpg')
  readAvatar(
    @Query('username') username: User.Username,
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

  @Get('tags')
  @Permission(UserPermission.read)
  async getTags(@Query('path') path: string) {
    try {
      const data = await this.fsService.getTags(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TAGS,
      }
    }
  }

  @Get('stream')
  @Permission(UserPermission.read)
  readStream(
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
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
}
