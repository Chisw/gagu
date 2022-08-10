import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getEntryList } from '../../utils/index'

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
        entryList: [
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
      console.log('API/LIST:', path)
      const entryList = getEntryList(path)
      const resData = {
        deviceName,
        entryList,
      }
      return resData
    }
  }
}
