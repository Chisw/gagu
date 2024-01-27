import { useCallback } from 'react'
import { INestedFile, IUploadTask, UploadTaskStatus } from '../types'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { generateRandomCode } from '../utils'
import { useRecoilState } from 'recoil'
import { uploadSignalState, uploadTaskListState } from '../states'

export function useAddUploadingTask () {
  const { t } = useTranslation()
  const [uploadTaskList, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [uploadSignal, setTransferSignal] = useRecoilState(uploadSignalState)

  const handleUploadTaskAdd = useCallback((nestedFileList: INestedFile[], basePath: string, targetDirName?: string) => {
    if (!nestedFileList.length) {
      toast.error(t`tip.noUploadableFilesDetected`)
      return
    }
    const newTaskList: IUploadTask[] = nestedFileList.map(nestedFile => {
      const { name, fullPath } = nestedFile
      const file = nestedFile as File
      const id = generateRandomCode()
      const path = `${basePath}${targetDirName ? `/${targetDirName}` : ''}${fullPath || `/${name}`}`

      return {
        id,
        status: UploadTaskStatus.waiting,
        file,
        path,
      }
    })
    setUploadTaskList([...uploadTaskList, ...newTaskList])
    setTransferSignal(uploadSignal + 1)
  }, [uploadTaskList, setUploadTaskList, uploadSignal, setTransferSignal, t])

  return { handleUploadTaskAdd }
}
