import { Injectable } from '@nestjs/common'
import { spawn } from 'child_process'
import { DateTime } from 'luxon'
import {
  IDialogForm,
  IDownloadForm,
  IInfraredTransmitForm,
  ILocationForm,
  ISMSQuery,
  MediaPlayerStateType,
} from 'src/types'

@Injectable()
export class TermuxService {
  async getBatteryStatus() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-battery-status')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  setBrightness(brightness: number | 'auto') {
    spawn('termux-brightness', [String(brightness)])
  }

  async getCallLog() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-call-log')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async getCameraInfo() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-camera-info')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async createCameraPhoto(cameraId: string) {
    const out = await new Promise((resolve, reject) => {
      const fileName = `IMG_${DateTime.local().toFormat('yyyyMMdd_HHmmss')}.jpg`
      const outputPath = `/data/data/com.termux/files/home/storage/shared/DCIM/Camera/${fileName}`
      const stream = spawn('termux-camera-photo', ['-c', cameraId, outputPath])
      stream.on('exit', () => resolve(outputPath))
      stream.stderr.on('error', reject)
    })
    return out
  }

  async getClipboard() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-clipboard-get')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out
  }

  async setClipboard(value: string) {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-clipboard-set', [value])
      stream.on('exit', () => resolve(true))
      stream.stderr.on('error', reject)
    })
    return out
  }

  async getContactList() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-contact-list')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async createDialog(form: IDialogForm) {
    const {
      widget,
      title,
      hint,
      values,
      range,
      dateFormat,
      multiple,
      inputType,
    } = form

    const params: string[] = [widget, '-t', title || '']

    if (['confirm', 'speech', 'text'].includes(widget)) {
      params.push('-i', hint || '')
    } else if (['checkbox', 'radio', 'sheet', 'spinner'].includes(widget)) {
      params.push('-v', values || '')
    } else if (widget === 'counter') {
      params.push('-r', range || '')
    } else if (widget === 'date') {
      params.push('-d', dateFormat || 'dd-MM-yyyy k:m:s')
    } else if (multiple) {
      params.push('-m')
    }

    if (widget === 'text' && inputType) {
      if (inputType === 'number') {
        params.push('-n')
      } else if (inputType === 'password') {
        params.push('-p')
      }
    }

    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-dialog', params)
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async createDownload(form: IDownloadForm) {
    const { title, description, path, url } = form

    const params = [
      '-t',
      title || 'NO_TITLE',
      '-d',
      description || 'NO_DESCRIPTION',
      '-p',
      // TODO:
      `${path}/${title}`,
      url,
    ]

    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-download', params)
      stream.on('exit', () => resolve(true))
      stream.stderr.on('error', reject)
    })
    return out
  }

  async getFingerprint() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-fingerprint')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async getInfraredFrequencies() {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-infrared-frequencies')
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async createInfraredTransmit(form: IInfraredTransmitForm) {
    const { frequency, pattern } = form

    const params = ['-f', String(frequency), pattern]

    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-infrared-transmit', params)
      stream.on('exit', () => resolve(true))
      stream.stderr.on('error', reject)
    })
    return out
  }

  async getLocation(form: ILocationForm) {
    const { provider, request } = form
    const params = ['-p', provider, '-r', request]
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-location', params)
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out ? JSON.parse(out as string) : out
  }

  async getMediaPlayerInfo() {
    const out: string = await new Promise((resolve, reject) => {
      const stream = spawn('termux-media-player', ['info'])
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out
  }

  async createMediaPlayerPlay(path: string) {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-media-player', ['play', path])
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out
  }

  async setMediaPlayerState(state: MediaPlayerStateType) {
    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-media-player', [state])
      stream.stdout.on('data', (buffer) => {
        resolve(buffer.toString('utf8'))
      })
      stream.stderr.on('error', reject)
    })
    return out
  }

  async getSMSList(form?: ISMSQuery) {
    const { limit = 200, offset = 0 } = form || {}
    const params = [
      '-l',
      String(limit),
      '-o',
      String(offset),
      '-t',
      'all',
      '-d',
      '-n',
    ]

    const out = await new Promise((resolve, reject) => {
      const stream = spawn('termux-sms-list', params)

      let allData = ''

      stream.stdout.on('data', (buffer) => {
        allData += buffer.toString('utf8')
      })

      stream.stdout.on('close', () => {
        resolve(allData)
      })

      stream.stderr.on('error', reject)
    })

    return out ? JSON.parse(out as string) : out
  }
}
