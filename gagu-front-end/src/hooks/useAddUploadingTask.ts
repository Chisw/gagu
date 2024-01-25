import { useCallback } from 'react'
import { INestedFile, ITransferTask, TransferTaskStatus } from '../types'
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
    const newTaskList: ITransferTask[] = nestedFileList.map(nestedFile => {
      const { name, fullPath } = nestedFile
      const file = nestedFile as File
      const id = generateRandomCode()
      const path = `${basePath}${targetDirName ? `/${targetDirName}` : ''}${fullPath || `/${name}`}`

      return {
        id,
        status: TransferTaskStatus.waiting,
        file,
        path,
      }
    })
    setTransferTaskList([...transferTaskList, ...newTaskList])
    setTransferSignal(transferSignal + 1)
  }, [transferTaskList, setTransferTaskList, transferSignal, setTransferSignal, t])

  return { handleUploadTaskAdd }
}
