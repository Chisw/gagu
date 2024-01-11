import { Injectable } from '@nestjs/common'
import { spawn } from 'child_process'
import { DateTime } from 'luxon'

@Injectable()
export class AndroidService {
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
}
