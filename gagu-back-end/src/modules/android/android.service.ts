import { Injectable } from '@nestjs/common'
import { spawn } from 'child_process'

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
}
