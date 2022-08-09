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

@Controller('/api/list')
export class ListController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  findAll(@Query('path') path: string) {
    if (['', '/'].includes(path)) {
      return {
        deviceName,
        entries: [
          {
            name: `/Users/${username}`,
            type: 'directory',
            size: undefined,
            hidden: false,
            lastModified: 0,
            hasChildren: false,
            mount: `/Users/${username}`,
            isVolume: false,
            spaceFree: 82341341312,
            spaceTotal: 212341341312,
          },
          {
            name: '/Volumes',
            type: 'directory',
            size: undefined,
            hidden: false,
            lastModified: 0,
            hasChildren: false,
            mount: '/Volumes',
            isVolume: false,
            spaceFree: 82341341312,
            spaceTotal: 212341341312,
          },
        ],
      }
    } else {
      const absPath = path
      console.log('API/LIST:', absPath)
      const entries = getEntries(absPath)
      const resData = {
        deviceName,
        entries,
      }
      return resData
    }
  }
}
