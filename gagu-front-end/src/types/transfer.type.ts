export enum TransferTaskStatus {
  waiting = 'waiting',
  uploading = 'uploading',
  moving = 'moving',
  success = 'success',
  fail = 'fail',
  cancel = 'cancel',
}

export type TransferTaskStatusType = TransferTaskStatus.waiting
  | TransferTaskStatus.uploading
  | TransferTaskStatus.moving
  | TransferTaskStatus.success
  | TransferTaskStatus.fail
  | TransferTaskStatus.cancel

export enum TransferTaskType {
  upload = 'upload',
  move = 'move',
}

export interface INestedFile extends File {
  fullPath: string
}

export interface ITransferTask {
  id: string
  type: TransferTaskType.upload | TransferTaskType.move
  status: TransferTaskStatusType
  file?: File
  newPath: string
  oldPath?: string
  abortController?: AbortController
}

export interface IUploadTransferTask extends ITransferTask {
  type: TransferTaskType.upload
  file: File
}

export interface IMoveTransferTask extends ITransferTask {
  type: TransferTaskType.move
  oldPath: string
}
