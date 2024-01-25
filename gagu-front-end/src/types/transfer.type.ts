export enum TransferTaskStatus {
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

export type TransferTaskStatusType = keyof typeof TransferTaskStatus

export interface INestedFile extends File {
  fullPath: string
}

export interface ITransferTask {
  id: string
  status: keyof typeof TransferTaskStatus
  file: File & { fullPath?: string }
  path: string
  abortController?: AbortController
}
