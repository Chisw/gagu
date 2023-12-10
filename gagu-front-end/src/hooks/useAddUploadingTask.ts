import { useCallback } from 'react'
import { INestedFile, IUploadTransferTask, TransferTaskStatus, TransferTaskType } from '../types'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { generateRandomCode } from '../utils'
import { useRecoilState } from 'recoil'
import { transferSignalState, transferTaskListState } from '../states'

export function useAddUploadingTask () {
  const { t } = useTranslation()
  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal, setTransferSignal] = useRecoilState(transferSignalState)

  const handleUploadTaskAdd = useCallback((nestedFileList: INestedFile[], basePath: string, targetDirName?: string) => {
    if (!nestedFileList.length) {
      toast.error(t`tip.noUploadableFilesDetected`)
      return
    }
    const newTaskList: IUploadTransferTask[] = nestedFileList.map(nestedFile => {
      const { name, fullPath } = nestedFile
      const file = nestedFile as File
      const id = generateRandomCode()
      const newPath = `${basePath}${targetDirName ? `/${targetDirName}` : ''}${fullPath || `/${name}`}`
      if (file.size > 2147483647) {
        toast.error(t`tip.2GBLimited`)
      }
      return {
        id,
        type: TransferTaskType.upload,
        status: TransferTaskStatus.waiting,
        file,
        newPath,
      }
    })
    setTransferTaskList([...transferTaskList, ...newTaskList])
    setTransferSignal(transferSignal + 1)
  }, [transferTaskList, setTransferTaskList, transferSignal, setTransferSignal, t])

  return { handleUploadTaskAdd }
}
