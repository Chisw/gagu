import { useCallback, useEffect, useRef, useState, ReactNode } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../../../api'
import { useRequest, useUserConfig } from '../../../hooks'
import { IUploadTask, UploadTaskStatusType } from '../../../types'
import { ExistingStrategyType } from '@shared'
import { getReadableSize } from '../../../utils'
import { lastChangedDirectoryState, uploadSignalState, uploadTaskListState } from '../../../states'
import { UploadContext } from './useUploadStatus'
import { ExistingConfirmor } from '../../../components/common/ExistingConfirmor'

// One service instance per system runtime.
export function UploadService({ children }: { children: ReactNode }) {
  const [uploadTaskList, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [uploadSignal] = useRecoilState(uploadSignalState)
  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { userConfig: { kiloSize } } = useUserConfig()

  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [uploadSignalCache, setTransferSignalCache] = useState(0)
  const [conflict, setConflict] = useState<{ count: number, tasks: IUploadTask[] } | null>(null)
  const [activeId, setActiveId] = useState('')
  const [busy, setBusy] = useState(false)

  const busyRef = useRef(false)

  const { request: createFile, loading: uploading } = useRequest(FsApi.createFile)
  const { request: queryExistsCount } = useRequest(FsApi.queryExistsCount)

  useEffect(() => {
    if (uploading) {
      setUploadInfo({ ratio: 0, speed: '' })
    }
  }, [uploading])

  const handleUploadStart = useCallback(async (uploadingTaskList: IUploadTask[], strategy?: ExistingStrategyType) => {
    const statusMap: { [PATH: string]: UploadTaskStatusType } = {}
    for (const task of uploadingTaskList) {
      const { id, path, file } = task
      setActiveId(id)
      setUploadTaskList(list => list.map(item => item.id === id ? { ...item, status: 'uploading' } : item))

      let lastUpload = { time: Date.now(), size: 0 }

      const onUploadProgress = (e: ProgressEvent) => {
        const { loaded, total } = e
        const { time, size } = lastUpload
        const now = Date.now()
        const interval = Math.max((now - time) / 1000, 0.001)
        const delta = loaded - size
        const speed = getReadableSize(delta / interval, kiloSize, { keepFloat: true }) + '/s'
        setUploadInfo({ ratio: total ? loaded / total : 0, speed })
        lastUpload = { time: now, size: loaded }
      }

      const { success, data: status } = await createFile(path, file, strategy, { onUploadProgress })
      if (success) {
        statusMap[id] = status
        setUploadInfo({ ratio: 0, speed: '' })
        const match = file.fullPath || `/${file.name}`
        setLastChangedDirectory({ path: path.replace(match, ''), timestamp: Date.now() })
      }
    }

    setUploadTaskList(list => list.map(task => ({
      ...task,
      status: statusMap[task.id] || (uploadingTaskList.some(item => item.id === task.id) ? 'waiting' : task.status),
    })))
    setActiveId('')
    busyRef.current = false
    setBusy(false)
  }, [setUploadTaskList, createFile, kiloSize, setLastChangedDirectory])

  const handleUploadCheck = useCallback(async (uploadingTaskList: IUploadTask[]) => {
    const pathList = uploadingTaskList.map(t => t.path)
    const { success, data: count } = await queryExistsCount({ pathList })
    if (!success) {
      busyRef.current = false
      setBusy(false)
      return
    }
    if (count) {
      setConflict({ count, tasks: uploadingTaskList })
    } else {
      void handleUploadStart(uploadingTaskList)
    }
  }, [handleUploadStart, queryExistsCount])

  useEffect(() => {
    if (!busy && !busyRef.current && uploadSignal !== uploadSignalCache) {
      const uploadingTaskList = uploadTaskList.filter(t => t.status === 'waiting') as IUploadTask[]
      if (uploadingTaskList.length) {
        busyRef.current = true
        setBusy(true)
        void handleUploadCheck(uploadingTaskList)
      }
      setTransferSignalCache(uploadSignal)
    }
  }, [busy, uploadSignal, uploadTaskList, handleUploadCheck, uploadSignalCache])

  const resolveConflict = useCallback((strategy?: ExistingStrategyType) => {
    if (!conflict) return
    const tasks = conflict.tasks
    setConflict(null)
    if (strategy) {
      void handleUploadStart(tasks, strategy)
    } else {
      const ids = new Set(tasks.map(task => task.id))
      setUploadTaskList(list => list.map(task => ids.has(task.id) ? { ...task, status: 'canceled' } : task))
      busyRef.current = false
      setBusy(false)
    }
  }, [conflict, handleUploadStart, setUploadTaskList])

  useEffect(() => {
    if (!conflict) return

    const confirmor = ExistingConfirmor({
      count: conflict.count,
      onConfirm: resolveConflict,
      onCancel: resolveConflict,
    })

    return () => confirmor.destroy()
  }, [conflict, resolveConflict])

  const clearCompleted = useCallback(() => {
    setUploadTaskList(list => list.filter(task => task.status === 'waiting' || task.status === 'uploading'))
  }, [setUploadTaskList])

  return (
    <UploadContext.Provider
      value={{
        uploading,
        uploadInfo,
        activeId,
        conflict,
        resolveConflict,
        clearCompleted,
      }}
    >
      {children}
    </UploadContext.Provider>
  )
}
