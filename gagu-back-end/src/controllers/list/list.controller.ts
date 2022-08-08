import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getEntries } from '../../utils/index'

const deviceName = 'mac-mini'
const username = process.env.USER
const ROOT_BASE = `/Users/${username}`

@Controller('/api/list')
export class ListController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    const dir = `${ROOT_BASE}${path}`
    console.log('API/LIST:', dir)
    const entries = getEntries(dir)
    const resData = {
      deviceName,
      entries,
    }
    return resData
  }
}
