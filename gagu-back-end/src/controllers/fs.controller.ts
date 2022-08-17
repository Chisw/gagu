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
  getThumbnailBase64,
  uploadFile,
} from 'src/utils/fs'
import { OS, Public } from 'src/utils'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'

const deviceName = `${OS.hostname} [${OS.platform}]`

@Controller('fs')
export class FsController {
  @Get('list')
  findAll(@Query('path') path: string) {
    console.log('FS/LIST:', path)
    const entryList = ['', '/'].includes(path)
      ? getRootEntryList()
      : getEntryList(path)
    return {
      deviceName,
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

  @Get('thumbnail')
  @Header('Content-Type', 'image/png')
  async readThumbnail(@Query('path') path: string) {
    console.log('FS/THUMBNAIL:', path)
    const base64 = await getThumbnailBase64(path)
    return base64
  }

  // TODO: remove public
  @Public()
  @Get('stream')
  readStream(@Query('path') path: string, @Res() response: Response) {
    console.log('FS/STREAM:', path)
    response.sendFile(path)
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
