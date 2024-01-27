export enum UploadTaskStatus {
  waiting = 'waiting',
  uploading = 'uploading',
  created = 'created',
  moved = 'moved',
  copied = 'copied',
  bothKept = 'bothKept',
  replaced = 'replaced',
  skipped = 'skipped',
  canceled = 'canceled',
}

export type UploadTaskStatusType = keyof typeof UploadTaskStatus

export interface INestedFile extends File {
  fullPath: string
}

export interface IUploadTask {
  id: string
  status: keyof typeof UploadTaskStatus
  file: File & { fullPath?: string }
  path: string
  abortController?: AbortController
}
