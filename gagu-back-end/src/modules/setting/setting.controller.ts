import { ISetting } from './../../types/setting.type'
import { SettingService } from './setting.service'
import { Body, Controller, Get, Put } from '@nestjs/common'
import { UserPermission } from '../../types'
import { Permission } from '../../common/decorators'
import { respond } from '../../utils'

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @Permission(UserPermission.administer)
  querySettings() {
    const settings: ISetting = this.settingService.findAll()
    return respond(settings)
  }

  @Put()
  @Permission(UserPermission.administer)
  updateSetting(@Body() settings: ISetting) {
    this.settingService.update(settings)
    return respond()
  }

  @Get('version')
  @Permission(UserPermission.administer)
  async queryLatestVersion() {
    const version = await this.settingService.getLatestVersion()
    return respond(version)
  }

  @Put('version')
  @Permission(UserPermission.administer)
  async updateVersion() {
    await this.settingService.updateVersion()
    setTimeout(() => process.exit(0), 1000)
    return respond()
  }

  @Put('shutdown')
  @Permission(UserPermission.administer)
  shutdown() {
    setTimeout(() => process.exit(0), 1000)
    return respond()
  }
}
