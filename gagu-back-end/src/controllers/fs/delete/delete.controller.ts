import {
  Controller,
  Delete,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
// TODO:
// import { deleteEntry } from 'src/utils'

@Controller('/api/delete')
export class DeleteController {
  @Delete()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    console.log('API/DELETE:', path)
    // TODO:
    // deleteEntry(path)
    return {
      ok: true,
    }
  }
}
