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
import { UserPermission, TunnelForm, IUser } from '../../types'
import { Permission } from '../../common/decorators/permission.decorator'
import { SERVER_MESSAGE_MAP, checkTunnel } from '../../utils'
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
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      tunnels,
    }
  }

  @Post()
  @Permission(UserPermission.read)
  create(@Body() tunnelForm: TunnelForm, @UserGetter() user: IUser) {
    const code = this.tunnelService.create(
      user.username,
      user.nickname,
      tunnelForm,
    )
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      code,
    }
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

  @Delete(':code')
  @Permission(UserPermission.read)
  delete(@Param('code') code: string, @UserGetter() user: IUser) {
    const tunnel = this.tunnelService.findOne(code)
    if (tunnel?.username === user.username) {
      this.tunnelService.remove(code)
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
  @Get(':code/check')
  check(
    @Param('code') code: string,
    @Query('password') inputtedPassword?: string,
  ) {
    const tunnel = this.tunnelService.findOne(code)
    const checkRes = checkTunnel(tunnel, inputtedPassword)
    return checkRes
  }
}
