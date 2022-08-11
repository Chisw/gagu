import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common'
import { getThumbnail } from 'src/utils'
import { Response } from 'express'

@Controller('/api/thumbnail')
export class ThumbnailController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'image/png')
  @Header('Access-Control-Allow-Origin', '*')
  async findAll(@Query('path') path: string, @Res() response: Response) {
    console.log('API/THUMBNAIL:', path)
    const thumbnailPath = await getThumbnail(path)
    response.download(thumbnailPath)
  }
}
