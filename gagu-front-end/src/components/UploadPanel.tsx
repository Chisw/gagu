import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { EmptyPanel, ExistingConfirmor, SvgIcon } from './common'
import { useRequest, useUserConfig } from '../hooks'
import { ExistingStrategyType, IUploadTask, UploadTaskStatusType } from '../types'
import { getReadableSize, line } from '../utils'
import { lastChangedDirectoryState, uploadSignalState, uploadTaskListState } from '../states'
import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { cloneDeep } from 'lodash-es'

const statusIconMap = {
  waiting: { icon: <SvgIcon.Time />, bg: 'bg-yellow-400' },
  uploading: { icon: <SvgIcon.Loader />, bg: 'bg-blue-500' },
  created: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  moved: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  copied: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  bothKept: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  replaced: { icon: <SvgIcon.Check />, bg: 'bg-green-500' },
  skipped: { icon: <SvgIcon.Close />, bg: 'bg-red-500' },
  canceled: { icon: <SvgIcon.Close />, bg: 'bg-red-500' },
}

export function UploadPanel() {

  const { t } = useTranslation()

  const [uploadTaskList, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [uploadSignal] = useRecoilState(uploadSignalState)
  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { userConfig: { kiloSize } } = useUserConfig()

  const [show, setShow] = useState(false)
  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [uploadSignalCache, setTransferSignalCache] = useState(0)
  const [activeId, setActiveId] = useState('')

  const { request: createFile, loading: uploading } = useRequest(FsApi.createFile)
  const { request: queryExistsCount } = useRequest(FsApi.queryExistsCount)

  const count = useMemo(() => {
    return uploadTaskList.length
  }, [uploadTaskList])

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

      const { success, data: status } = await createFile(path, file, strategy, { onUploadProgress })
      if (success) {
        statusMap[path] = status
        setUploadInfo({ ratio: 0, speed: '' })
        const match = file.fullPath || `/${file.name}`
        setLastChangedDirectory({ path: path.replace(match, ''), timestamp: Date.now() })
      }
    }

    const list = cloneDeep(uploadTaskList)
    list.forEach(task => {
      const status = statusMap[task.path]
      if (status) {
        task.status = status
      }
    })
    setUploadTaskList(list)
    setActiveId('')
  }, [uploadTaskList, setUploadTaskList, createFile, kiloSize, setLastChangedDirectory])

  const handleUploadCheck = useCallback(async (uploadingTaskList: IUploadTask[]) => {
    const pathList = uploadingTaskList.map(t => t.path)
    const { data: count } = await queryExistsCount({ pathList })
    if (count) {
      ExistingConfirmor({
        count,
        onConfirm: (strategy) => handleUploadStart(uploadingTaskList, strategy),
        onCancel: () => {
          const list = cloneDeep(uploadTaskList)
          list.forEach(task => {
            if (pathList.includes(task.path)) {
              task.status = 'canceled'
            }
          })
          setUploadTaskList(list)
        },
      })
    } else {
      handleUploadStart(uploadingTaskList)
    }
  }, [handleUploadStart, queryExistsCount, setUploadTaskList, uploadTaskList])

  useEffect(() => {
    if (uploadSignal !== uploadSignalCache) {
      const uploadingTaskList = uploadTaskList.filter(t => t.status === 'waiting') as IUploadTask[]
      if (uploadingTaskList.length) {
        handleUploadCheck(uploadingTaskList)
      }
      setTransferSignalCache(uploadSignal)
    }
  }, [uploadSignal, uploadTaskList, handleUploadCheck, uploadSignalCache])

  return (
    <>
      <div
        className={line(`
          relative px-2 h-full
          text-xs select-none
          transition-width duration-200
          items-center cursor-pointer
          hover:bg-white hover:bg-opacity-30 active:bg-black active:bg-opacity-10
          ${count ? 'flex' : 'hidden'}
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
        <SvgIcon.Upload className="hidden md:block" />
        <SvgIcon.Upload size={18} className="block md:hidden" />
        <span className="font-din text-center flex-grow">
          {uploading && uploadInfo.speed}
        </span>
        <span className={`ml-1 font-din ${count ? '' : 'hidden'}`}>
          {uploadTaskList.filter(t => ['created', 'bothKept', 'replaced', 'canceled', 'skipped'].includes(t.status)).length}
          &nbsp;/&nbsp;
          {count}
        </span>
      </div>

      <SideSheet
        data-customized-scrollbar
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex items-center">
            <SvgIcon.Upload size={24} />
            <span className="ml-2 font-din text-base">{count}</span>
            <div className="flex-grow flex justify-end">
              {count > 0 && (
                <Button
                  size="small"
                  icon={<SvgIcon.Brush />}
                  onClick={() => {
                    setUploadTaskList([])
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
          <EmptyPanel dark show={!count} />

          {uploadTaskList.map((task, taskIndex) => {
            const { id, file, status, path } = task
            const isActive = id === activeId
            const name = file ? file.name : ''
            const len = uploadTaskList.length.toString().length
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
                    {path}
                  </p>
                </div>
                <div>
                  <div className={`inline-block ml-4 p-1 rounded-full text-white ${bg}`}>
                    {icon}
                  </div>
                  <div className="text-xs">{status.toUpperCase()}</div>
                </div>
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
