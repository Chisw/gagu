// Sync following code to BE & FE
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

export interface IContact {
  name: string
  number: string
}

export interface IDialogForm {
  widget:
    | 'confirm'
    | 'checkbox'
    | 'counter'
    | 'date'
    | 'radio'
    | 'sheet'
    | 'spinner'
    | 'speech'
    | 'text'
    | 'time'
  title?: string
  hint?: string
  values?: string
  range?: string
  dateFormat?: string
  multiple?: boolean
  inputType?: 'number' | 'password'
}

export interface IDownloadForm {
  title: string
  description: string
  path: string
  url: string
}

export interface IInfraredFrequency {
  min: number
  max: number
}

export interface IInfraredTransmitForm {
  frequency: number
  pattern: string
}

export type LocationProviderType = 'gps' | 'network' | 'passive'
export type LocationRequestType = 'once' | 'last' | 'updates'

export interface ILocationForm {
  provider: LocationProviderType
  request: LocationRequestType
}

export interface ILocation {
  longitude: number
  latitude: number
  altitude: number
  accuracy: number
  vertical_accuracy: number
  bearing: number
  speed: number
  elapsedMs: number
  provider: LocationProviderType
}

export type MediaPlayerStateType = 'play' | 'pause' | 'stop'

export interface ISMSQuery {
  limit?: number
  offset?: number
}

export interface ISMS {
  _id: number
  threadid: number
  type: 'inbox' | 'outbox' | 'sent' | 'draft'
  received: string
  read: boolean
  number: number
  body: string
}
