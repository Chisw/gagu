import { Permission } from '../../common/decorators'
import { AndroidService } from './android.service'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ServerMessage, UserPermission } from '../../types'
import { catchError, respond } from '../../utils'

@Controller('android')
export class AndroidController {
  constructor(private readonly androidService: AndroidService) {}

  @Get('battery-status')
  @Permission(UserPermission.administer)
  async getBatteryStatus() {
    try {
      const data = await this.androidService.getBatteryStatus()
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('brightness')
  @Permission(UserPermission.administer)
  async setBrightness(@Body('brightness') brightness: number | 'auto') {
    this.androidService.setBrightness(brightness)
    return respond()
  }

  @Get('call-log')
  @Permission(UserPermission.administer)
  async getCallLog() {
    try {
      const data = await this.androidService.getCallLog()
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('camera-info')
  @Permission(UserPermission.administer)
  async getCameraInfo() {
    try {
      const data = await this.androidService.getCameraInfo()
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('camera-photo/:cameraId')
  @Permission(UserPermission.administer)
  async createCameraPhoto(@Param('cameraId') cameraId: string) {
    try {
      const path = await this.androidService.createCameraPhoto(cameraId)
      return respond({ path })
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('clipboard')
  @Permission(UserPermission.administer)
  async getClipboard() {
    try {
      const value = await this.androidService.getClipboard()
      return respond({ value })
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }
}
