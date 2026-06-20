import { useCallback } from 'react'
import { INestedFile, IUploadTask, UploadTaskStatus } from '../types'
import { Toast } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { generateRandomCode } from '../utils'
import { useRecoilState } from 'recoil'
import { uploadSignalState, uploadTaskListState } from '../states'

export function useAddUploadingTask () {
  const { t } = useTranslation()
  const [, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [uploadSignal, setTransferSignal] = useRecoilState(uploadSignalState)

  const handleUploadTaskAdd = useCallback((nestedFileList: INestedFile[], basePath: string, targetDirName?: string) => {
    if (!nestedFileList.length) {
      Toast.error(t`tip.noUploadableFilesDetected`)
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
    setUploadTaskList((list) => [...list, ...newTaskList])
    setTransferSignal(uploadSignal + 1)
  }, [setUploadTaskList, uploadSignal, setTransferSignal, t])

  return { handleUploadTaskAdd }
}
