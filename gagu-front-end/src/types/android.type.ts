export interface IBatteryStatus {
  health: string
  percentage: number
  plugged: 'UNPLUGGED' | 'PLUGGED_AC' | 'PLUGGED_WIRELESS'
  status: 'CHARGING' | 'DISCHARGING'
  temperature: number
  current: number
}

export type BrightnessType = number | 'auto'

export interface ICameraInfo {
  id: string
  auto_exposure_modes: string[]
  capabilities: string[]
  facing: 'back' | 'front'
  focal_lengths: number[]
  jpeg_output_sizes: {
    width: number
    height: number
  }[]
  physical_size: {
    width: number
    height: number
  }
}
