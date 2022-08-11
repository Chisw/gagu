import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getDirectorySize } from 'src/utils'

@Controller('/api/size')
export class SizeController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    console.log('API/SIZE:', path)
    const size = getDirectorySize(path)
    return {
      hasDon: true,
      size,
    }
  }
}
