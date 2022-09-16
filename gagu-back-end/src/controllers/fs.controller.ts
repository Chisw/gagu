import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
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
import {
  getDirectorySize,
  getExists,
  getRootEntryList,
  getEntryList,
  renameEntry,
  addDirectory,
  getTextContent,
  deleteEntry,
  getThumbnailPath,
  uploadFile,
  getExif,
  getTags,
  GAGU_VERSION,
  OS,
  Public,
  GAGU_CONFIG_PATH,
} from 'src/utils'

@Controller('fs')
export class FsController {
  @Get('root')
  getRoot() {
    console.log('FS/ROOT')
    const rootEntryList = getRootEntryList()
    return {
      version: GAGU_VERSION,
      platform: OS.platform,
      deviceName: OS.hostname,
      desktopEntryList: getEntryList(`${GAGU_CONFIG_PATH}/desktop`),
      rootEntryList,
    }
  }

  @Get('list')
  findAll(@Query('path') path: string) {
    console.log('FS/LIST:', path)
    const entryList = getEntryList(path)
    return {
      success: true,
      entryList,
    }
  }

  @Get('exists')
  readExists(@Query('path') path: string) {
    console.log('FS/EXISTS:', path)
    const exists = getExists(path)
    return {
      success: true,
      exists,
    }
  }

  @Get('size')
  readSize(@Query('path') path: string) {
    console.log('FS/SIZE:', path)
    const size = getDirectorySize(path)
    return {
      success: true,
      size,
    }
  }

  @Get('text')
  readTextContent(@Query('path') path: string) {
    console.log('FS/TEXT:', path)
    const textContent = getTextContent(path)
    return textContent
  }

  @Put('rename')
  update(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    console.log('FS/RENAME:', oldPath, 'to', newPath)
    renameEntry(oldPath, newPath)
    return {
      success: true,
    }
  }

  @Post('mkdir')
  create(@Body('path') path: string) {
    console.log('FS/MKDIR:', path)
    addDirectory(path)
    return { success: true }
  }

  @Delete('delete')
  remove(@Query('path') path: string) {
    console.log('FS/DELETE:', path)
    deleteEntry(path)
    return { success: true }
  }

  @Public()
  @Get('thumbnail')
  @Header('Content-Type', 'image/png')
  async readThumbnail(
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    console.log('FS/THUMBNAIL:', path)
    try {
      if (token && token.length === 8) {
        const filePath = await getThumbnailPath(path)
        response.sendFile(filePath)
      } else {
        response.end('TOKEN ERROR')
      }
    } catch (err) {
      console.log('ERR: THUMBNAIL')
      response.end('ERROR')
    }
  }

  @Get('exif')
  async getExif(@Query('path') path: string) {
    console.log('FS/EXIF:', path)
    try {
      const data = await getExif(path)
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
    console.log('FS/TAGS:', path)
    try {
      const data = await getTags(path)
      return data
    } catch (err) {
      console.log('ERR: EXIF')
      return {
        success: false,
        msg: 'TAGS ERROR',
      }
    }
  }

  @Public()
  @Get('stream')
  readStream(
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    console.log('FS/STREAM:', path)
    if (token && token.length === 8) {
      response.sendFile(path)
    } else {
      response.end('TOKEN ERROR')
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('FS/UPLOAD:', path)
    return uploadFile(path, file.buffer)
  }

  // TODO: remove public
  @Public()
  @Get('download*')
  getDownload(
    @Query('path') path: string,
    @Query('entry') entryList: string[],
    @Res() response: Response,
  ) {
    console.log('FS/DOWNLOAD:', { path, entryList })
    if (entryList) {
      console.log()
    } else {
      response.download(path)
    }
  }
}
