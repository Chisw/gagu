import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getExists } from 'src/utils'

@Controller('/api/exists')
export class ExistsController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    console.log('API/EXISTS:', path)
    const exists = getExists(path)
    return { exists }
  }
}
