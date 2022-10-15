import { Response } from 'express'

export interface ZipResponseFile {
  name: string
  path: string
}

export interface ZipResponse extends Response {
  zip: (files: ZipResponseFile[], name?: string, cb?: () => void) => void
}
