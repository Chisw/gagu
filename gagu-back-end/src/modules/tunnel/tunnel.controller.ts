import { FsService } from '../fs/fs.service'
import { Public, Permission, UserGetter } from '../../common/decorators'
import { TunnelService } from './tunnel.service'
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
  TunnelForm,
  IUser,
  ServerMessage,
  EntryType,
  ZipResponse,
  ZipResponseFile,
} from '../../types'
import { checkTunnel, getEntryPath, respond } from '../../utils'

@Controller('tunnel')
export class TunnelController {
  constructor(
    private readonly tunnelService: TunnelService,
    private readonly fsService: FsService,
  ) {}

  @Get()
  @Permission(UserPermission.read)
  queryTunnelList(@UserGetter() user: IUser) {
    const tunnels = this.tunnelService.findUserTunnels(user.username)
    return respond(tunnels)
  }

  @Post()
  @Permission(UserPermission.read)
  createTunnel(@Body() tunnelForm: TunnelForm, @UserGetter() user: IUser) {
    const code = this.tunnelService.create(
      user.username,
      user.nickname,
      tunnelForm,
    )
    return respond(code)
  }

  @Public()
  @Get(':code')
  queryTunnel(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    if (tunnel) {
      const { entryList, password } = tunnel
      if (password) {
        if (!inputtedPassword) {
          return respond(
            {
              tunnel: {
                ...tunnel,
                password: undefined,
                entryList: [],
              },
              flatList: [],
            },
            undefined,
            ServerMessage.ERROR_TUNNEL_PASSWORD_NEEDED,
          )
        } else if (inputtedPassword !== password) {
          return respond(null, ServerMessage.ERROR_TUNNEL_PASSWORD_WRONG)
        }
      }
      const flatList = this.fsService.getRecursiveFlatEntryList(entryList)
      return respond({
        tunnel: {
          ...tunnel,
          password: undefined,
        },
        flatList,
      })
    } else {
      return respond(null, ServerMessage.ERROR_TUNNEL_NOT_EXISTED)
    }
  }

  @Delete(':code')
  @Permission(UserPermission.read)
  deleteTunnel(@Param('code') code: string, @UserGetter() user: IUser) {
    const tunnel = this.tunnelService.findOne(code)
    if (tunnel?.username === user.username) {
      this.tunnelService.remove(code)
      return respond()
    } else {
      return respond(null, ServerMessage.ERROR_403_USER_NOT_MATCHED)
    }
  }

  @Public()
  @Get(':code/check')
  queryTunnelCheck(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    const result = checkTunnel(tunnel, inputtedPassword)
    return result
  }

  @Public()
  @Get(':code/download')
  download(
    @Param('code') code: string,
    @Query('password') inputtedPassword: string,
    @Res() response: ZipResponse,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    const result = checkTunnel(tunnel, inputtedPassword)

    if (result.success && tunnel) {
      const { entryList, downloadName } = tunnel
      const firstEntry = entryList[0]
      const isSingleFile =
        entryList.length === 1 && firstEntry.type === EntryType.file

      this.tunnelService.minusTimes(code)

      if (isSingleFile) {
        return response.download(getEntryPath(firstEntry))
      }

      const rootParentPath = firstEntry.parentPath
      const list = this.fsService.getRecursiveFlatEntryList(entryList)
      const files: ZipResponseFile[] = list.map((entry) => {
        const path = getEntryPath(entry)
        const name = path.replace(rootParentPath, '')
        return { name, path }
      })

      response.zip(files, encodeURIComponent(downloadName))
    } else {
      response.end(JSON.stringify(result))
    }
  }
}
