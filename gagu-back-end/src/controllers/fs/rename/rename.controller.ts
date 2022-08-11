import {
  Controller,
  Put,
  Header,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common'
// TODO:
// import { renameEntry } from 'src/utils'

@Controller('/api/rename')
export class RenameController {
  @Put()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    console.log('API/RENAME:', ' oldPath: ', oldPath, ', newPath:', newPath)
    // TODO:
    // renameEntry(oldPath, newPath)
    return {
      ok: true,
    }
  }
}
