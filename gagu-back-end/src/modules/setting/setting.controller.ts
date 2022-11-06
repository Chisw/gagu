import { ISetting } from './../../types/setting.type'
import { SettingService } from './setting.service'
import { Body, Controller, Get, Put } from '@nestjs/common'
import { UserPermission } from '../../types'
import { Permission } from '../../common/decorators/permission.decorator'
import { SERVER_MESSAGE_MAP } from '../../utils'

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @Permission(UserPermission.administer)
  findAll() {
    const settings: ISetting = this.settingService.findAll()
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      settings,
    }
  }

  @Put()
  @Permission(UserPermission.administer)
  update(@Body() settings: ISetting) {
    this.settingService.update(settings)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }
}
