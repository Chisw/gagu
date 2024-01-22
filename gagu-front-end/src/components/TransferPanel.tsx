import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { EmptyPanel, SvgIcon } from './common'
import { useRequest, useUserConfig } from '../hooks'
import { IUploadTransferTask } from '../types'
import { getReadableSize, line } from '../utils'
import { lastChangedDirectoryState, transferSignalState, transferTaskListState } from '../states'
import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { cloneDeep } from 'lodash-es'

const statusIconMap = {
  waiting: { icon: <SvgIcon.Time />, bg: 'bg-yellow-400' },
  uploading: { icon: <SvgIcon.Loader />, bg: 'bg-blue-500' },
  moving: { icon: <SvgIcon.Loader />, bg: 'bg-blue-500' },
  success: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  fail: { icon: <SvgIcon.Close />, bg: 'bg-red-500' },
  cancel: { icon: <SvgIcon.Warning />, bg: 'bg-pink-500' },
  exceed: { icon: <SvgIcon.Warning />, bg: 'bg-red-500' },
}

export function TransferPanel() {

  const { t } = useTranslation()

  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal] = useRecoilState(transferSignalState)
  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { userConfig: { kiloSize } } = useUserConfig()

  const [show, setShow] = useState(false)
  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [transferSignalCache, setTransferSignalCache] = useState(0)
  const [activeId, setActiveId] = useState('')

  const { request: uploadFile, loading: uploading } = useRequest(FsApi.uploadFile)

  useEffect(() => {
    if (uploading) {
      setUploadInfo({ ratio: 0, speed: '' })
    }
  }, [uploading])

  const handleUploadStart = useCallback(async (uploadingTaskList: IUploadTransferTask[]) => {
    for (const task of uploadingTaskList) {
      const { id, newPath, file } = task
      setActiveId(id)

      let lastUpload = { time: Date.now(), size: 0 }

      const onUploadProgress = (e: ProgressEvent) => {
        const { loaded, total } = e
        const { time, size } = lastUpload
        const now = Date.now()
        const interval = (now - time) / 1000
        const delta = loaded - size
        const speed = getReadableSize(delta / interval, kiloSize, { keepFloat: true }) + '/s'
        setUploadInfo({ ratio: loaded / total, speed })
        lastUpload = { time: now, size: loaded }
      }

      const { success } = await uploadFile(newPath, file, { onUploadProgress })
      if (success) {
        setUploadInfo({ ratio: 0, speed: '' })
        const match = file.fullPath || `/${file.name}`
        setLastChangedDirectory({ path: newPath.replace(match, ''), timestamp: Date.now() })
      }
    }

    const list = cloneDeep(transferTaskList)
    list.forEach(t => t.status = 'success')
    setTransferTaskList(list)
    setActiveId('')
  }, [transferTaskList, setTransferTaskList, uploadFile, kiloSize, setLastChangedDirectory])

  useEffect(() => {
    if (transferSignal !== transferSignalCache) {
      const uploadingTaskList = transferTaskList.filter(t => t.type === 'upload' && t.status === 'waiting') as IUploadTransferTask[]
      uploadingTaskList.length && handleUploadStart(uploadingTaskList)
      setTransferSignalCache(transferSignal)
    }
  }, [transferSignal, transferTaskList, handleUploadStart, transferSignalCache])

  return (
    <>
      <div
        className={line(`
          relative px-1 h-full
          text-xs select-none
          transition-width duration-200
          flex items-center cursor-pointer
          hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10
          ${uploading ? 'w-28 bg-white bg-opacity-40' : ''}
        `)}
        onClick={() => setShow(true)}
      >
        <div
          className={line(`
            absolute left-0 bottom-0 right-0
            h-[2px] bg-green-400
            transition-width
            ${uploadInfo.ratio === 0 ? '' : 'duration-200'}
            ${uploading ? 'block' : 'hidden'}
          `)}
          style={{ width: `${uploadInfo.ratio * 100}%` }}
        />
        <SvgIcon.Transfer className="hidden md:block" />
        <SvgIcon.Transfer size={18} className="block md:hidden" />
        <span className="font-din text-center flex-grow">
          {uploading && uploadInfo.speed}
        </span>
        <span className={`ml-1 font-din ${transferTaskList.length ? '' : 'hidden'}`}>
          {transferTaskList.filter(t => t.status === 'success').length}
          &nbsp;/&nbsp;
          {transferTaskList.length}
        </span>
      </div>

      <SideSheet
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex items-center">
            <SvgIcon.Transfer size={24} />
            <span className="ml-2 font-din text-base">{transferTaskList.length}</span>
            <div className="flex-grow flex justify-end">
              {transferTaskList.length > 0 && (
                <Button
                  size="small"
                  icon={<SvgIcon.Brush />}
                  onClick={() => {
                    setTransferTaskList([])
                    setTimeout(() => setShow(false), 300)
                  }}
                >
                  {t`action.clear`}
                </Button>
              )}
              &nbsp;
              <Button
                type="danger"
                size="small"
                icon={<SvgIcon.Close />}
                className="gagu-sync-popstate-overlay-close-button"
                onClick={() => setShow(false)}
              />
            </div>
          </div>
        )}
        closable={false}
        headerStyle={{ padding: '8px 12px' }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={400}
        visible={show}
        onCancel={() => setShow(false)}
      >
        <div className="relative w-full h-full overflow-auto">
          <EmptyPanel dark show={!transferTaskList.length} />

          {transferTaskList.map((task, taskIndex) => {
            const { id, file, status, newPath } = task
            const isActive = id === activeId
            const name = file ? file.name : ''
            const len = transferTaskList.length.toString().length
            const indexStr = `${(taskIndex + 1).toString().padStart(len, '0')}`
            const { icon, bg } = statusIconMap[status]
            return (
              <div
                key={id}
                className={line(`
                  relative px-4 py-2
                  flex justify-between items-center
                  border-b border-gray-100
                  dark:border-black dark:border-opacity-10
                `)}
              >
                <div>
                  <p
                    className={line(`
                      mb-1 text-sm font-bold
                      dark:text-zinc-100
                      ${isActive ? 'text-green-500' : ''}
                    `)}
                  >
                    {indexStr}. {name}
                  </p>
                  <p className="text-xs text-gray-500 break-all dark:text-zinc-300">
                    {newPath}
                  </p>
                </div>
                &nbsp;
                <span className={`inline-block ml-4 p-1 rounded-full text-white ${bg}`}>
                  {icon}
                </span>
                {isActive && (
                  <div
                    className={`
                      absolute left-0 bottom-0 right-0
                      h-1 bg-green-400
                      transition-width
                      ${uploadInfo.ratio === 0 ? '' : 'duration-200'}
                      ${uploading ? 'block' : 'hidden'}
                    `}
                    style={{ width: `${uploadInfo.ratio * 100}%` }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </SideSheet>
    </>
  )
}
