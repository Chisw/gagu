import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { deleteEntry, getExists } from 'src/utils'
import { Public } from 'src/common/decorators/public.decorator'
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
import { User } from 'src/types'
import { mkdirSync, renameSync } from 'fs'

@Controller('fs')
export class FsController {
  constructor(private readonly fsService: FsService) {}

  @Get('root')
  getRoot() {
    return this.fsService.getRootEntryList()
  }

  @Get('list')
  findAll(@Query('path') path: string) {
    const entryList = this.fsService.getEntryList(path)
    return {
      success: true,
      entryList,
    }
  }

  @Get('exists')
  readExists(@Query('path') path: string) {
    const exists = getExists(path)
    return {
      success: true,
      exists,
    }
  }

  @Get('size')
  readSize(@Query('path') path: string) {
    const size = this.fsService.getDirectorySize(path)
    return {
      success: true,
      size,
    }
  }

  @Get('text')
  readTextContent(@Query('path') path: string) {
    const textContent = this.fsService.getTextContent(path)
    return textContent
  }

  @Put('rename')
  update(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    renameSync(oldPath, newPath)
    return {
      success: true,
    }
  }

  @Post('mkdir')
  create(@Body('path') path: string) {
    mkdirSync(path)
    return { success: true }
  }

  @Delete('delete')
  remove(@Query('path') path: string) {
    deleteEntry(path)
    return { success: true }
  }

  @Get('thumbnail')
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
  async getExif(@Query('path') path: string) {
    try {
      const data = await this.fsService.getExif(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        message: 'EXIF ERROR',
      }
    }
  }

  @Get('tags')
  async getTags(@Query('path') path: string) {
    try {
      const data = await this.fsService.getTags(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        message: 'TAGS ERROR',
      }
    }
  }

  @Get('stream')
  readStream(
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    response.sendFile(path)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fsService.uploadFile(path, file.buffer)
  }

  // TODO: remove public
  @Public()
  @Get('download*')
  getDownload(
    @Query('path') path: string,
    @Query('entry') entryList: string[],
    @Res() response: Response,
  ) {
    if (entryList) {
      console.log()
    } else {
      response.download(path)
    }
  }
}
