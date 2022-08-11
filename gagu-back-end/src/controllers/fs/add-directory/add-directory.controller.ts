import {
  Controller,
  Post,
  Header,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common'
import { addDirectory } from 'src/utils'

@Controller('/api/addDirectory')
export class AddDirectoryController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Body('path') path: string) {
    console.log('API/ADD_DIRECTORY:', ' path: ', path)
    addDirectory(path)
    return {
      ok: true,
    }
  }
}
