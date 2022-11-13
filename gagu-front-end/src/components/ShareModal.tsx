import { Button, DatePicker, Input, InputNumber, Modal } from '@douyinfe/semi-ui'
import { useState } from 'react'
import Icon from '../apps/FileExplorer/EntryIcon'
import { IEntry } from '../types'
import { getReadableSize } from '../utils'

interface ShareModalProps {
  visible: boolean
  entryList: IEntry[]
  onClose: () => void
}

export default function ShareModal(props: ShareModalProps) {

  const {
    visible,
    entryList,
    onClose,
  } = props

  const [password, setPassword] = useState('')
  const [leftTimes, setLeftTimes] = useState<number | undefined>(undefined)

  return (
    <>
      <Modal
        centered
        title="创建分享链接"
        width={640}
        visible={visible}
        footer={(
          <div className="flex justify-end">
            <Button
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              theme="solid"
              className="w-32"
            >
              创建
            </Button>
          </div>
        )}
        onCancel={onClose}
      >
        <div className="backdrop-filter backdrop-blur-sm">
          <div className="px-3 py-2 text-xs bg-white-500 border border-b-0 border-gray-100 font-din flex justify-between items-center">
            <span>
              <span className="text-gray-600">分享 {entryList.length} 个项目</span>
            </span>
          </div>
          <div className="max-h-48 overflow-x-hidden overflow-y-auto">
            <div className="px-4 md:px-8 py-3 md:py-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-gray-100 bg-opacity-40">
              {entryList.map((entry: IEntry) => (
                <div
                  key={entry.parentPath + entry.name}
                  title={entry.name}
                  className="text-center"
                >
                  <Icon hideApp entry={entry} />
                  <p className="line-clamp-2 mt-1 text-xs break-all max-w-32">{entry.name}</p>
                  <p className="text-xs text-gray-400">{entry.type === 'file' && getReadableSize(entry.size || 0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex">
          <Input
            showClear
            placeholder="访问密码（留空无）"
            type="password"
            className="w-1/3"
            value={password}
            onChange={setPassword}
          />
          <InputNumber
            showClear
            placeholder="可下载次数（留空不限）"
            className="mx-2 w-1/3"
            value={leftTimes}
            min={1}
            onChange={times => setLeftTimes(times as number)}
          />
          <DatePicker
            showClear
            placeholder="有效期（留空不限）"
            type="dateTime"
            format="yyyy-MM-dd HH:mm"
            className="w-1/3"
          />
        </div>
      </Modal>
    </>
  )
}
