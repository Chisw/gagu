import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { getEntryList, USERNAME } from 'src/utils'

const deviceName = 'mac-mini'
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
            name: `/Users/${USERNAME}`,
            type: 'directory',
            size: undefined,
            hidden: false,
            lastModified: 0,
            hasChildren: false,
            mount: `/Users/${USERNAME}`,
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
