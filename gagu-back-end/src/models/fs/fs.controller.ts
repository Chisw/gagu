import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { getExists } from 'src/utils'
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

@Controller('fs')
export class FsController {
  constructor(private readonly fsService: FsService) {}

  @Get('root')
  getRoot() {
    console.log('GET /FS/ROOT')
    return this.fsService.getRootEntryList()
  }

  @Get('list')
  findAll(@Query('path') path: string) {
    console.log('GET /FS/LIST', path)
    const entryList = this.fsService.getEntryList(path)
    return {
      success: true,
      entryList,
    }
  }

  @Get('exists')
  readExists(@Query('path') path: string) {
    console.log('GET /FS/EXISTS', path)
    const exists = getExists(path)
    return {
      success: true,
      exists,
    }
  }

  @Get('size')
  readSize(@Query('path') path: string) {
    console.log('GET /FS/SIZE:', path)
    const size = this.fsService.getDirectorySize(path)
    return {
      success: true,
      size,
    }
  }

  @Get('text')
  readTextContent(@Query('path') path: string) {
    console.log('GET /FS/TEXT', path)
    const textContent = this.fsService.getTextContent(path)
    return textContent
  }

  @Put('rename')
  update(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    console.log('PUT /FS/RENAME', oldPath, 'to', newPath)
    this.fsService.renameEntry(oldPath, newPath)
    return {
      success: true,
    }
  }

  @Post('mkdir')
  create(@Body('path') path: string) {
    console.log('POST /FS/MKDIR', path)
    this.fsService.addDirectory(path)
    return { success: true }
  }

  @Delete('delete')
  remove(@Query('path') path: string) {
    console.log('DELETE /FS/DELETE', path)
    this.fsService.deleteEntry(path)
    return { success: true }
  }

  @Get('thumbnail')
  @Header('Content-Type', 'image/jpg')
  async readThumbnail(@Query('path') path: string, @Res() response: Response) {
    console.log('GET /FS/THUMBNAIL', path)
    try {
      const filePath = await this.fsService.getThumbnailPath(path)
      response.sendFile(filePath)
    } catch (err) {
      console.log('ERR: THUMBNAIL')
      response.end('ERROR')
    }
  }

  @Get('avatar')
  @Header('Content-Type', 'image/jpg')
  readAvatar(
    @Query('username') username: User.Username,
    @Res() response: Response,
  ) {
    console.log('GET /FS/AVATAR', username)
    try {
      const avatarPath = this.fsService.getAvatarPath(username)
      response.sendFile(avatarPath)
    } catch (err) {
      console.log('ERR: AVATAR')
      response.end('ERROR')
    }
  }

  @Get('exif')
  async getExif(@Query('path') path: string) {
    console.log('GET /FS/EXIF', path)
    try {
      const data = await this.fsService.getExif(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        msg: 'EXIF ERROR',
      }
    }
  }

  @Get('tags')
  async getTags(@Query('path') path: string) {
    console.log('GET /FS/TAGS:', path)
    try {
      const data = await this.fsService.getTags(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        msg: 'TAGS ERROR',
      }
    }
  }

  @Get('stream')
  readStream(
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    console.log('GET /FS/STREAM', path)
    response.sendFile(path)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('POST /FS/UPLOAD', path)
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
    console.log('GET /FS/DOWNLOAD', { path, entryList })
    if (entryList) {
      console.log()
    } else {
      response.download(path)
    }
  }
}
