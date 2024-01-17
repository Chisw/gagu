import { PathValidation, Permission } from '../../common/decorators'
import { TermuxService } from './termux.service'
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import {
  IDialogForm,
  IDownloadForm,
  IInfraredTransmitForm,
  LocationProviderType,
  LocationRequestType,
  MediaPlayerStateType,
  ServerMessage,
  UserPermission,
} from '../../types'
import { catchError, respond } from '../../utils'

@Controller('termux')
export class TermuxController {
  constructor(private readonly termuxService: TermuxService) {}

  @Get('battery-status')
  @Permission(UserPermission.administer)
  async getBatteryStatus() {
    try {
      const data = await this.termuxService.getBatteryStatus()
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('brightness')
  @Permission(UserPermission.administer)
  async setBrightness(@Body('brightness') brightness: number | 'auto') {
    this.termuxService.setBrightness(brightness)
    return respond()
  }

  @Get('call-log')
  @Permission(UserPermission.administer)
  async getCallLog() {
    try {
      const data = await this.termuxService.getCallLog()
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
      const data = await this.termuxService.getCameraInfo()
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
      const path = await this.termuxService.createCameraPhoto(cameraId)
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
      const value = await this.termuxService.getClipboard()
      return respond({ value })
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Put('clipboard')
  @Permission(UserPermission.administer)
  async setClipboard(@Body('value') value: string) {
    try {
      await this.termuxService.setClipboard(value)
      return respond()
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('contact-list')
  @Permission(UserPermission.administer)
  async getContactList() {
    try {
      const list = await this.termuxService.getContactList()
      return respond(list)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('dialog')
  @Permission(UserPermission.administer)
  async createDialog(@Body() form: IDialogForm) {
    try {
      const res = await this.termuxService.createDialog(form)
      return respond(res)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('download')
  @Permission(UserPermission.administer)
  @PathValidation({ bodyFields: ['path'] })
  async createDownload(@Body() form: IDownloadForm) {
    try {
      await this.termuxService.createDownload(form)
      return respond()
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('fingerprint')
  @Permission(UserPermission.administer)
  async getFingerprint() {
    try {
      const res = await this.termuxService.getFingerprint()
      return respond(res)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('infrared-frequencies')
  @Permission(UserPermission.administer)
  async getInfraredFrequencies() {
    try {
      const list = await this.termuxService.getInfraredFrequencies()
      return respond(list)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('infrared-transmit')
  @Permission(UserPermission.administer)
  async createInfraredTransmit(@Body() form: IInfraredTransmitForm) {
    try {
      const list = await this.termuxService.createInfraredTransmit(form)
      return respond(list)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('location')
  @Permission(UserPermission.administer)
  async getLocation(
    @Query('provider') provider: LocationProviderType,
    @Query('request') request: LocationRequestType,
  ) {
    try {
      const data = await this.termuxService.getLocation({ provider, request })
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Get('media-player')
  @Permission(UserPermission.administer)
  async getMediaPlayerInfo() {
    try {
      const data = await this.termuxService.getMediaPlayerInfo()
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Post('media-player')
  @Permission(UserPermission.administer)
  @PathValidation({ queryFields: ['path'] })
  async createMediaPlayerPlay(@Query('path') path: string) {
    try {
      const data = await this.termuxService.createMediaPlayerPlay(path)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }

  @Put('media-player/:state')
  @Permission(UserPermission.administer)
  async setMediaPlayerState(@Param('state') state: MediaPlayerStateType) {
    try {
      const data = await this.termuxService.setMediaPlayerState(state)
      return respond(data)
    } catch (error) {
      catchError(error)
      return respond(null, ServerMessage.ERROR_NO_RESPONSE)
    }
  }
}
