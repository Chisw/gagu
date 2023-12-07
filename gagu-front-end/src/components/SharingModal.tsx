import { Button, Form, Modal } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FsApi, TunnelApi } from '../api'
import { useRequest, useTouchMode } from '../hooks'
import { IEntry, TunnelType } from '../types'
import { copy, getDownloadInfo } from '../utils'
import { EntryListPanel, SvgIcon } from './common'
import QrCode from 'qrcode.react'
import toast from 'react-hot-toast'
import md5 from 'md5'
import { useTranslation } from 'react-i18next'
import { semiLocaleMap } from '../i18n'

const newForm = () => ({
  downloadName: '',
  expiredAt: undefined,
  password: '',
  leftTimes: undefined,
})

interface SharingModalProps {
  show: boolean
  entryList: IEntry[]
  onClose: () => void
}

export function SharingModal(props: SharingModalProps) {

  const {
    show,
    entryList,
    onClose,
  } = props

  const { t, i18n: { language } } = useTranslation()

  const touchMode = useTouchMode()

  const [form, setForm] = useState<{
    downloadName: string
    expiredAt: number | undefined
    password: string
    leftTimes: number | undefined
  }>(newForm())

  const [tunnelLink, setTunnelLink] = useState('')

  const { request: queryFlattenEntryList, loading, data } = useRequest(FsApi.queryFlattenEntryList)
  const { request: createTunnel, loading: creating } = useRequest(TunnelApi.createTunnel)

  useEffect(() => {
    if (!show) {
      setTunnelLink('')
      setForm(newForm())
    }
  }, [show])

  useEffect(() => {
    if (entryList.length) {
      queryFlattenEntryList(entryList)
    }
  }, [entryList, queryFlattenEntryList])

  useEffect(() => {
    if (entryList.length) {
      const { downloadName } = getDownloadInfo(entryList[0].parentPath, entryList, t)
      setForm({ ...form, downloadName })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryList])

  const handleCreate = useCallback(async () => {
    const { downloadName, password } = form
    if (downloadName && entryList.length) {
      const { success, data: code } = await createTunnel({
        ...form,
        password: password ? md5(password) : undefined,
        type: TunnelType.share,
        entryList,
      })
      if (success && code) {
        setTunnelLink(`${window.location.origin}/sharing/${code}`)
      }
    }
  }, [form, entryList, createTunnel])

  const isCreating = useMemo(() => !tunnelLink, [tunnelLink])

  return (
    <>
      <Modal
        centered
        maskClosable={false}
        title={(
          <span className="relative z-10">
            {isCreating ? t`title.createSharingLink` : t`title.createdSuccessfully`}
          </span>
        )}
        fullScreen={touchMode}
        bodyStyle={{ maxHeight: '80%', overflowY: 'auto' }}
        width={isCreating ? 640 : 480}
        visible={show}
        footer={isCreating ? (
          <div className="relative z-10 flex justify-end">
            <Button
              onClick={onClose}
            >
              {t`action.cancel`}
            </Button>
            <Button
              theme="solid"
              className="w-32"
              loading={loading || creating}
              onClick={handleCreate}
            >
              {t`action.confirm`}
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
                  <div className="w-full md:w-1/2">
                    <Form.Input
                      showClear
                      autoComplete="off"
                      field="downloadName"
                      label={t`label.downloadName`}
                      placeholder={t`hint.input`}
                      onChange={downloadName => setForm({ ...form, downloadName })}
                      rules={[
                        { required: true, message: t`hint.required` },
                      ]}
                    />
                  </div>
                  <div className="w-full md:pl-4 md:w-1/2">
                    <Form.Input
                      showClear
                      field="password"
                      label={t`label.password`}
                      placeholder={t`hint.noLimitLeaveBlank`}
                      mode="password"
                      onChange={password => setForm({ ...form, password })}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <Form.InputNumber
                      showClear
                      autoComplete="off"
                      field="leftTimes"
                      label={t`label.downloadTimes`}
                      placeholder={t`hint.noLimitLeaveBlank`}
                      className="w-full"
                      min={1}
                      onChange={val => setForm({ ...form, leftTimes: val === '' ? undefined : Number(val) })}
                    />
                  </div>
                  <div className="w-full md:pl-4 md:w-1/2">
                    <Form.DatePicker
                      showClear
                      type="dateTime"
                      field="expiredAt"
                      label={t`label.validUntil`}
                      placeholder={t`hint.noLimitLeaveBlank`}
                      className="w-full"
                      format="yyyy-MM-dd HH:mm"
                      disabledDate={date => date ? date?.getTime() <= (Date.now() - 24 * 60 * 60 * 1000) : false}
                      timePickerOpts={{ minuteStep: 10 }}
                      locale={semiLocaleMap[language].DatePicker}
                      onChange={date => setForm({ ...form, expiredAt: date ? new Date(date as Date).getTime() : undefined })}
                    />
                  </div>
                </div>
              </Form>
            </div>
            <EntryListPanel
              downloadName={form.downloadName}
              entryList={entryList}
              flattenList={data?.data || []}
            />
          </>
        ) : (
          <div className={`relative z-10 pt-2 pb-8 flex ${touchMode ? 'flex-wrap justify-center' : 'justify-between'}`}>
            <QrCode value={tunnelLink} className="ring-8 ring-white" />
            <div className={`flex flex-col justify-between ${touchMode ? 'mt-4' : 'pl-8'}`}>
              <div className="font-din text-base text-gray-500 break-all">{tunnelLink}</div>
              <div className={`flex justify-end ${touchMode ? 'mt-8' : ''}`}>
                <Button
                  className="mr-2"
                  icon={<SvgIcon.ExternalLink />}
                  onClick={() => window.open(tunnelLink)}
                >
                  {t`action.view`}
                </Button>
                <Button
                  type="primary"
                  theme="solid"
                  icon={<SvgIcon.Copy />}
                  onClick={() => {
                    copy(tunnelLink)
                    toast.success(t('tip.copied', { value: tunnelLink }))
                    onClose()
                  }}
                >
                  {t`action.copyAndClose`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
