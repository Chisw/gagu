import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getTextContent } from 'src/utils'

@Controller('/api/textContent')
export class TextContentController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    console.log('API/SIZE:', path)
    const textContent = getTextContent(path)
    return textContent
    // return {
    //   hasDon: true,
    //   textContent,
    // }
  }
}
