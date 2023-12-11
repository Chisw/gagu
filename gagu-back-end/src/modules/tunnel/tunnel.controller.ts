import { FsService } from '../fs/fs.service'
import { Public } from '../../common/decorators/public.decorator'
import { TunnelService } from './tunnel.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { UserPermission, TunnelForm, IUser, ServerMessage } from '../../types'
import { Permission } from '../../common/decorators/permission.decorator'
import { checkTunnel, respond } from '../../utils'
import { UserGetter } from 'src/common/decorators/user.decorator'

@Controller('tunnel')
export class TunnelController {
  constructor(
    private readonly tunnelService: TunnelService,
    private readonly fsService: FsService,
  ) {}

  @Get()
  @Permission(UserPermission.read)
  findSelfTunnels(@UserGetter() user: IUser) {
    const tunnels = this.tunnelService.findUserTunnels(user.username)
    return respond(tunnels)
  }

  @Post()
  @Permission(UserPermission.read)
  create(@Body() tunnelForm: TunnelForm, @UserGetter() user: IUser) {
    const code = this.tunnelService.create(
      user.username,
      user.nickname,
      tunnelForm,
    )
    return respond(code)
  }

  @Public()
  @Get(':code')
  findOne(
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
              flattenList: [],
            },
            undefined,
            ServerMessage.ERROR_TUNNEL_PASSWORD_NEEDED,
          )
        } else if (inputtedPassword !== password) {
          return respond(null, ServerMessage.ERROR_TUNNEL_PASSWORD_WRONG)
        }
      }
      const flattenList = this.fsService.getRecursiveFlattenEntryList(entryList)
      return respond({
        tunnel: {
          ...tunnel,
          password: undefined,
        },
        flattenList,
      })
    } else {
      return respond(null, ServerMessage.ERROR_TUNNEL_NOT_EXISTED)
    }
  }

  @Delete(':code')
  @Permission(UserPermission.read)
  delete(@Param('code') code: string, @UserGetter() user: IUser) {
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
  check(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    const result = checkTunnel(tunnel, inputtedPassword)
    return result
  }
}
