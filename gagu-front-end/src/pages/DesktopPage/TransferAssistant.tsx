import { useCallback, useEffect, useState } from 'react'
// import toast from 'react-hot-toast'
import { useRecoilState } from 'recoil'
import { FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { ITransferTask, IUploadTransferTask, TransferTaskStatus, TransferTaskStatusType, TransferTaskType } from '../../types'
import { getReadableSize, line } from '../../utils'
import { lastUploadedPathState, transferSignalState, transferTaskListState } from '../../states'
import { SideSheet } from '@douyinfe/semi-ui'

const statusIconMap = {
  waiting: <SvgIcon.Time />,
  uploading: <SvgIcon.Loader />,
  moving: <SvgIcon.Loader />,
  success: <SvgIcon.Check />,
  fail: <SvgIcon.Close />,
  cancel: <SvgIcon.Warning />,
}

export default function TransferAssistant() {

  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal] = useRecoilState(transferSignalState)
  const [, setLastUploadedPath] = useRecoilState(lastUploadedPathState)

  const [visible, setVisible] = useState(false)
  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [transferSignalCache, setTransferSignalCache] = useState(0)

  const { fetch: uploadFile, loading: uploading } = useFetch(FsApi.uploadFile)

  const updateTaskStatus = useCallback((tasks: ITransferTask[], status: TransferTaskStatusType) => {
    const list = [...transferTaskList]
    tasks.forEach(({ id: taskId }) => {
      const foundTask = list.find(t => t.id === taskId)!
      const foundTaskIndex = list.findIndex(t => t.id === taskId)
      list.splice(foundTaskIndex, 1, { ...foundTask, status })
    })

    setTransferTaskList(list)
  }, [transferTaskList, setTransferTaskList])

  const handleUploadStart = useCallback(async (uploadTaskList: IUploadTransferTask[]) => {

    updateTaskStatus(uploadTaskList, TransferTaskStatus.uploading)

    for (const task of uploadTaskList) {
      const { newPath, file } = task
      let lastUpload = { time: Date.now(), size: 0 }

      const onUploadProgress = (e: ProgressEvent) => {
        const { loaded, total } = e
        const { time, size } = lastUpload
        const now = Date.now()
        const interval = (now - time) / 1000
        const delta = loaded - size
        const speed = getReadableSize(delta / interval, { keepFloat: true }) + '/s'
        setUploadInfo({ ratio: loaded / total, speed })
        lastUpload = { time: now, size: loaded }
      }
      const { success } = await uploadFile(newPath, file, { onUploadProgress })
      updateTaskStatus([task], success ? TransferTaskStatus.success : TransferTaskStatus.fail)
      // TODO: cut from end
      setLastUploadedPath({ path: newPath.replace(`/${file.name}`, ''), timestamp: Date.now() })
    }
    // updateTaskStatus(uploadTaskList, TransferTaskStatus.success)

    // handleRefresh()
    // ; (uploadInputRef.current as any).value = ''
  }, [updateTaskStatus, uploadFile, setLastUploadedPath])

  useEffect(() => {
    if (transferSignal !== transferSignalCache) {
      const uploadTaskList = transferTaskList.filter(t => t.type === TransferTaskType.upload && t.status === TransferTaskStatus.waiting) as IUploadTransferTask[]
      console.log(uploadTaskList)
      uploadTaskList.length && handleUploadStart(uploadTaskList)
      setTransferSignalCache(transferSignal)
    }
  }, [transferSignal, transferTaskList, handleUploadStart, transferSignalCache])

  return (
    <>
      <div
        className="relative px-2 min-w-36 h-full flex items-center cursor-pointer text-xs hover:bg-black-200 active:bg-black-300"
        onClick={() => setVisible(true)}
      >
        <div
          className={`transition-width duration-200 absolute left-0 bottom-0 right-0 h-1px bg-green-400 ${uploading ? 'block' : 'hidden'}`}
          style={{ width: `${uploadInfo.ratio * 100}%` }}
        />
        <SvgIcon.Transfer />
        &nbsp;
        <span className="flex-grow">传输助手</span>
        {uploading && (
          <span className="font-din text-xs">{uploadInfo.speed}</span>
        )}
        &nbsp;
        <span className="ml-1 font-din">
          {transferTaskList.filter(t => t.status === 'success').length}
          &nbsp;/&nbsp;
          {transferTaskList.length}
        </span>
      </div>

      <SideSheet
        title="传输列表"
        headerStyle={{ padding: '8px 20px', borderBottom: '1px solid #efefef' }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={300}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <div className="max-h-full overflow-y-auto">
          {transferTaskList.map((task, taskIndex) => {
            const { id, file, status, newPath } = task
            const name = file ? file.name : ''
            const isSuccess = status === 'success'
            const len = transferTaskList.length.toString().length
            const indexStr = `${(taskIndex + 1).toString().padStart(len, '0')}`
            return (
              <div
                key={id}
                className="py-1 text-xs flex justify-between items-center hover:bg-gray-100"
              >
                <div className="truncate">
                  <p>{indexStr}. {name}</p>
                  <p className="text-gray-500">{newPath}</p>
                </div>
                &nbsp;
                <span
                  className={line(`
                    inline-block p-1 rounded-full text-white
                    ${isSuccess ? 'bg-green-500' : 'bg-yellow-400'}
                  `)}
                >
                  {statusIconMap[status]}
                </span>
              </div>
            )
          })}
        </div>
        <div
          className="mt-2 text-xs flex justify-center cursor-pointer"
          onClick={() => setTransferTaskList([])}
        >
          <SvgIcon.CloseCircle /> 清空
        </div>
      </SideSheet>
    </>
  )
}
