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
  getDeviceInfo,
  getEntryList,
  renameEntry,
  addDirectory,
  getTextContent,
  deleteEntry,
  getThumbnail,
  uploadFile,
} from 'src/utils'
import { Response } from 'express'
import { getMockRootEntryList } from 'src/utils/mock'
import { Public } from 'src/utils/api.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

const { platform, hostname } = getDeviceInfo()
const deviceName = `${hostname} [${platform}]`

@Controller('fs')
export class FsController {
  @Get('list')
  findAll(@Query('path') path: string) {
    console.log('API/FS/LIST:', path)
    const entryList = ['', '/'].includes(path)
      ? getMockRootEntryList()
      : getEntryList(path)
    return {
      deviceName,
      entryList,
    }
  }

  @Get('exists')
  readExists(@Query('path') path: string) {
    console.log('API/FS/EXISTS:', path)
    const exists = getExists(path)
    return {
      success: true,
      exists,
    }
  }

  @Get('size')
  readSize(@Query('path') path: string) {
    console.log('API/FS/SIZE:', path)
    const size = getDirectorySize(path)
    return {
      success: true,
      size,
    }
  }

  @Get('text')
  readTextContent(@Query('path') path: string) {
    console.log('API/FS/TEXT:', path)
    const textContent = getTextContent(path)
    return textContent
  }

  @Put('rename')
  update(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    console.log('API/FS/RENAME:', oldPath, 'to', newPath)
    renameEntry(oldPath, newPath)
    return {
      success: true,
    }
  }

  @Post('mkdir')
  create(@Body('path') path: string) {
    console.log('API/FS/MKDIR:', path)
    addDirectory(path)
    return { success: true }
  }

  @Delete('delete')
  remove(@Query('path') path: string) {
    console.log('API/FS/DELETE:', path)
    deleteEntry(path)
    return { success: true }
  }

  // TODO: remove public
  @Public()
  @Get('thumbnail')
  @Header('Content-Type', 'image/png')
  async readThumbnail(@Query('path') path: string, @Res() response: Response) {
    console.log('API/FS/THUMBNAIL:', path)
    const thumbnailPath = await getThumbnail(path)
    response.download(thumbnailPath)
  }

  // TODO: remove public
  @Public()
  @Get('stream')
  readStream(@Query('path') path: string, @Res() response: Response) {
    console.log('API/FS/STREAM:', path)
    response.sendFile(path)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('API/FS/UPLOAD:', path)
    return uploadFile(path, file.buffer)
  }

  // TODO: remove public
  @Public()
  @Get('download*')
  readDownload(
    @Query('path') path: string,
    @Query('entry') entryList: string[],
    @Res() response: Response,
  ) {
    console.log('API/FS/DOWNLOAD:', { path, entryList })
    if (entryList) {
      console.log()
    } else {
      response.download(path)
    }
  }
}
