export enum TransferTaskStatus {
  waiting = 'waiting',
  uploading = 'uploading',
  moving = 'moving',
  success = 'success',
  fail = 'fail',
  cancel = 'cancel',
}

export type TransferTaskStatusType = keyof typeof TransferTaskStatus

export enum TransferTaskType {
  upload = 'upload',
  move = 'move',
}

export interface INestedFile extends File {
  fullPath: string
}

export interface ITransferTask {
  id: string
  type: keyof typeof TransferTaskType
  status: keyof typeof TransferTaskStatus
  file?: File & { fullPath?: string }
  newPath: string
  oldPath?: string
  abortController?: AbortController
}

export interface IUploadTransferTask extends ITransferTask {
  type: TransferTaskType.upload
  file: File & { fullPath?: string }
}

export interface IMoveTransferTask extends ITransferTask {
  type: TransferTaskType.move
  oldPath: string
}
