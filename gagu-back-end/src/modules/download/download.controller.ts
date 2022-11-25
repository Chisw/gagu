import { FsService } from './../fs/fs.service'
import { Public } from '../../common/decorators/public.decorator'
import { DownloadService } from './download.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import {
  UserPermission,
  DownloadTunnelForm,
  EntryType,
  ZipResponse,
  ZipResponseFile,
  IUser,
} from '../../types'
import { Permission } from '../../common/decorators/permission.decorator'
import 'express-zip'
import { SERVER_MESSAGE_MAP, getEntryPath, checkTunnel } from '../../utils'
import { UserGetter } from 'src/common/decorators/user.decorator'

@Controller('download')
export class DownloadController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly fsService: FsService,
  ) {}

  @Post()
  @Permission(UserPermission.read)
  create(@Body() tunnelForm: DownloadTunnelForm, @UserGetter() user: IUser) {
    const code = this.downloadService.create(user.username, tunnelForm)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      code,
    }
  }

  @Get('tunnels')
  @Permission(UserPermission.read)
  findSelfTunnels(@UserGetter() user: IUser) {
    const tunnels = this.downloadService.findUserTunnels(user.username)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      tunnels,
    }
  }

  @Get('tunnels/:username')
  @Permission(UserPermission.administer)
  findUserTunnels(@Param('username') username: string) {
    const tunnels = this.downloadService.findUserTunnels(username)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      tunnels,
    }
  }

  @Delete('tunnels/:code')
  @Permission(UserPermission.read)
  delete(@Param('code') code: string, @UserGetter() user: IUser) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel?.username === user.username) {
      this.downloadService.remove(code)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
      }
    } else {
      return {
        success: false,
        messsage: SERVER_MESSAGE_MAP.ERROR_403,
      }
    }
  }

  @Public()
  @Get(':code')
  download(
    @Param('code') code: string,
    @Query('password') inputtedPassword: string,
    @Res() response: ZipResponse,
  ) {
    const tunnel = this.downloadService.findOne(code)
    const checkRes = checkTunnel(tunnel, inputtedPassword)

    if (checkRes.success && tunnel) {
      const { entryList, downloadName } = tunnel
      const firstEntry = entryList[0]
      const isSingleFile =
        entryList.length === 1 && firstEntry.type === EntryType.file
      this.downloadService.minusTimes(code)
      if (isSingleFile) {
        return response.download(getEntryPath(firstEntry))
      }
      const rootParentPath = firstEntry.parentPath
      const list = this.fsService.getFlattenRecursiveEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(rootParentPath, '')
        return { name, path }
      })
      response.zip(files, downloadName)
    } else {
      return checkRes
    }
  }

  @Public()
  @Get(':code/info')
  findOne(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.downloadService.findOne(code)
    if (tunnel) {
      const { entryList, password } = tunnel
      if (password) {
        if (!inputtedPassword) {
          return {
            success: true,
            message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_NEEDED,
            tunnel: {
              ...tunnel,
              password: undefined,
              entryList: [],
            },
            flattenList: [],
          }
        } else if (inputtedPassword !== password) {
          return {
            success: false,
            message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_PASSWORD_WRONG,
          }
        }
      }
      const flattenList = this.fsService.getFlattenRecursiveEntryList(entryList)
      return {
        success: true,
        message: SERVER_MESSAGE_MAP.OK,
        tunnel: {
          ...tunnel,
          password: undefined,
        },
        flattenList,
      }
    } else {
      return {
        success: false,
        message: SERVER_MESSAGE_MAP.ERROR_TUNNEL_NOT_EXISTED,
      }
    }
  }

  @Public()
  @Get(':code/check')
  check(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.downloadService.findOne(code)
    const checkRes = checkTunnel(tunnel, inputtedPassword)
    return checkRes
  }
}
