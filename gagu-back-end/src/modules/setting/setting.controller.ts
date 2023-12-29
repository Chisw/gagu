import { ISetting } from './../../types/setting.type'
import { SettingService } from './setting.service'
import { Body, Controller, Get, Post, Put } from '@nestjs/common'
import { UserPermission } from '../../types'
import { Permission } from '../../common/decorators'
import { respond } from '../../utils'

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @Permission(UserPermission.administer)
  findAll() {
    const settings: ISetting = this.settingService.findAll()
    return respond(settings)
  }

  @Put()
  @Permission(UserPermission.administer)
  update(@Body() settings: ISetting) {
    this.settingService.update(settings)
    return respond()
  }

  @Get('version')
  @Permission(UserPermission.administer)
  async getLatestVersion() {
    const version = await this.settingService.getLatestVersion()
    return respond(version)
  }

  @Post('version')
  @Permission(UserPermission.administer)
  async updateVersion() {
    await this.settingService.updateVersion()
    setTimeout(() => process.exit(0), 1000)
    return respond()
  }
}
