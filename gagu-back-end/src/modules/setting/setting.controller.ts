import { ISetting } from './../../types/setting.type'
import { SettingService } from './setting.service'
import { Body, Controller, Get, Post, Put } from '@nestjs/common'
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
      data: settings,
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

  @Get('version')
  @Permission(UserPermission.administer)
  async getLatestVersion() {
    const version = await this.settingService.getLatestVersion()
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
      data: version,
    }
  }

  @Post('version')
  @Permission(UserPermission.administer)
  async updateVersion() {
    await this.settingService.updateVersion()
    setTimeout(() => process.exit(0), 1000)
    return {
      success: true,
      message: SERVER_MESSAGE_MAP.OK,
    }
  }
}
