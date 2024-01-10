import { Permission } from '../../common/decorators'
import { AndroidService } from './android.service'
import { Controller, Get } from '@nestjs/common'
import { ServerMessage, UserPermission } from '../../types'
import { catchError, respond } from '../../utils'

@Controller('android')
export class AndroidController {
  constructor(private readonly androidService: AndroidService) {}

  @Get('battery-status')
  @Permission(UserPermission.administer)
  async findSelfTunnels() {
    try {
      const status = await this.androidService.getBatteryStatus()
      return respond(status)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }
}
