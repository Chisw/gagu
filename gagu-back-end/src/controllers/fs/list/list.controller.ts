import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { IVolume } from 'src/types'
import { getDeviceInfo, getEntryList } from 'src/utils'

const { username, platform, hostname } = getDeviceInfo()
const deviceName = `${hostname}[${platform}]`

const rootEntryList: IVolume[] = []

if (platform === 'darwin') {
  rootEntryList.push(
    {
      name: 'Home',
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
      name: 'Volumes',
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
  )
} else if (platform === 'android') {
  rootEntryList.push(
    {
      name: 'Home',
      type: 'directory',
      size: undefined,
      hidden: false,
      lastModified: 0,
      hasChildren: false,
      mount: '/data/data/com.termux/files/home',
      isVolume: false,
      spaceFree: 82341341312,
      spaceTotal: 212341341312,
    },
    {
      name: 'Shared',
      type: 'directory',
      size: undefined,
      hidden: false,
      lastModified: 0,
      hasChildren: false,
      mount: '/data/data/com.termux/files/home/storage/shared',
      isVolume: false,
      spaceFree: 82341341312,
      spaceTotal: 212341341312,
    },
  )
}

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
        entryList: rootEntryList,
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
