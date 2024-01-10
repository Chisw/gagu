export interface IBatteryStatus {
  health: string
  percentage: number
  plugged: 'UNPLUGGED' | 'PLUGGED_AC' | 'PLUGGED_WIRELESS'
  status: 'CHARGING' | 'DISCHARGING'
  temperature: number
  current: number
}
