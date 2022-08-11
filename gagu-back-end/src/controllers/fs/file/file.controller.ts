import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common'
import { Response } from 'express'

@Controller('/api/file')
export class FileController {
  @Get()
  @HttpCode(HttpStatus.OK)
  // @Header('Content-Type', 'image/png')
  @Header('Access-Control-Allow-Origin', '*')
  async findAll(@Query('path') path: string, @Res() response: Response) {
    console.log('API/FILE:', path)
    response.download(path)
  }
}
