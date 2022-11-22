import { Button, Form, Modal } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DownloadApi, FsApi } from '../api'
import { useFetch } from '../hooks'
import { IEntry, DownloadTunnelType } from '../types'
import { copy, getDownloadInfo } from '../utils'
import EntryListPanel from './EntryListPanel'
import QrCode from 'qrcode.react'
import { SvgIcon } from './base'
import toast from 'react-hot-toast'
import md5 from 'md5'

const newForm = () => ({
  downloadName: '',
  expiredAt: undefined,
  password: '',
  leftTimes: undefined,
})

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

  const [form, setForm] = useState<{
    downloadName: string
    expiredAt: number | undefined
    password: string
    leftTimes: number | undefined
  }>(newForm())

  const [tunnelLink, setTunnelLink] = useState('')

  const { fetch: getFlattenEntryList, loading, data } = useFetch(FsApi.getFlattenEntryList)
  const { fetch: createTunnel, loading: creating } = useFetch(DownloadApi.create)

  useEffect(() => {
    if (!visible) {
      setTunnelLink('')
      setForm(newForm())
    }
  }, [visible])

  useEffect(() => {
    if (entryList.length) {
      getFlattenEntryList(entryList)
    }
  }, [entryList, getFlattenEntryList])

  useEffect(() => {
    if (entryList.length) {
      const { downloadName } = getDownloadInfo(entryList[0].parentPath, entryList)
      setForm({ ...form, downloadName })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryList])

  const flattenList = useMemo(() => {
    return data?.flattenList || []
  }, [data])

  const handleCreate = useCallback(async () => {
    if (form.downloadName && entryList.length) {
      const res = await createTunnel({
        ...form,
        password: md5(form.password),
        type: DownloadTunnelType.share,
        entryList,
      })
      if (res?.success && res.code) {
        setTunnelLink(`${window.location.origin}/share/${res.code}`)
      }
    }
  }, [form, entryList, createTunnel])

  const isCreating = useMemo(() => !tunnelLink, [tunnelLink])

  return (
    <>
      <Modal
        centered
        maskClosable={false}
        title={isCreating ? '创建分享链接' : '创建成功'}
        width={isCreating ? 640 : 480}
        visible={visible}
        footer={isCreating ? (
          <div className="flex justify-end">
            <Button
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              theme="solid"
              className="w-32"
              loading={loading || creating}
              onClick={handleCreate}
            >
              创建
            </Button>
          </div>
        ) : undefined}
        onCancel={onClose}
      >
        <div className="absolute z-0 bottom-0 left-0 -mb-16 -ml-16">
          <SvgIcon.Share className="text-gray-100" size={320} />
        </div>
        {isCreating ? (
          <>
            <div className="mb-4">
              <Form initValues={form}>
                <div className="flex flex-wrap">
                  <div className="w-1/2">
                    <Form.Input
                      showClear
                      autoComplete="off"
                      field="downloadName"
                      label="保存名称"
                      placeholder="请输入保存名称"
                      onChange={downloadName => setForm({ ...form, downloadName })}
                      rules={[
                        { required: true, message: 'Required' },
                      ]}
                    />
                  </div>
                  <div className="pl-4 w-1/2">
                    <Form.Input
                      showClear
                      field="password"
                      label="访问密码"
                      placeholder="留空不限"
                      mode="password"
                      onChange={password => setForm({ ...form, password })}
                    />
                  </div>
                  <div className="w-1/2">
                    <Form.InputNumber
                      showClear
                      autoComplete="off"
                      field="leftTimes"
                      label="可下载次数"
                      placeholder="留空不限"
                      className="w-full"
                      min={1}
                      onChange={val => setForm({ ...form, leftTimes: Number(val) })}
                    />
                  </div>
                  <div className="pl-4 w-1/2">
                    <Form.DatePicker
                      showClear
                      type="dateTime"
                      field="expiredAt"
                      label="有效期"
                      placeholder="留空不限"
                      className="w-full"
                      format="yyyy-MM-dd HH:mm"
                      disabledDate={date => date ? date?.getTime() <= (Date.now() - 24 * 60 * 60 * 1000) : false}
                      timePickerOpts={{ minuteStep: 10 }}
                      onChange={date => setForm({ ...form, expiredAt: date ? new Date(date as Date).getTime() : undefined })}
                    />
                  </div>
                </div>
              </Form>
            </div>
            <EntryListPanel
              downloadName={form.downloadName}
              entryList={entryList}
              flattenList={flattenList}
            />
          </>
        ) : (
          <div className="relative z-10 pt-2 pb-8 flex justify-between">
            <QrCode value={tunnelLink} className="ring-8 ring-white" />
            <div className="pl-8 flex flex-col justify-between">
              <div className="font-din text-base text-gray-500 break-all">{tunnelLink}</div>
              <div className="flex justify-end">
                <Button
                  className="mr-2"
                  icon={<SvgIcon.ExternalLink />}
                  onClick={() => window.open(tunnelLink)}
                >
                  查看
                </Button>
                <Button
                  type="primary"
                  theme="solid"
                  icon={<SvgIcon.Copy />}
                  onClick={() => {
                    copy(tunnelLink)
                    toast.success('链接已复制到剪贴板')
                    onClose()
                  }}
                >
                  复制链接并关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
