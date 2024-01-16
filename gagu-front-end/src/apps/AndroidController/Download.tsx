import { Button, Input } from '@douyinfe/semi-ui'
import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { AppId, EntryType, IDownloadForm } from '../../types'
import { EntryPicker, EntryPickerMode } from '../../components'
import { SvgIcon } from '../../components/common'


export default function Download() {

  const { t } = useTranslation()

  const [pickerShow, setPickerShow] = useState(false)
  const [form, setForm] = useState<IDownloadForm>({
    title: '',
    description: '',
    path: '',
    url: '',
  })

  const { request: createDownload, loading } = useRequest(TermuxApi.createDownload)

  const handleDownload = useCallback(async () => {
    const { success } = await createDownload(form)
    if (success) {
      toast.success('OK')
    }
  }, [createDownload, form])

  return (
    <>
      <div className="relative">
        <Input
          placeholder="URL"
          className="mb-2"
          value={form.url}
          onChange={url => setForm({ ...form, url })}
        />
        <Input
          placeholder="Path"
          className="mb-2"
          value={form.path}
          onChange={path => setForm({ ...form, path })}
          suffix={(
            <Button
              icon={<SvgIcon.FolderOpen />}
              onClick={() => setPickerShow(true)}
            />
          )}
        />
        <Input
          placeholder="Title"
          className="mb-2"
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />
        <Input
          placeholder="Description"
          className="mb-2"
          value={form.description}
          onChange={description => setForm({ ...form, description })}
        />
        <Button
          className="w-16"
          loading={loading}
          onClick={handleDownload}
        >
          {t`action.download`}
        </Button>
      </div>

      <EntryPicker
        show={pickerShow}
        appId={AppId.androidController}
        mode={EntryPickerMode.open}
        type={EntryType.directory}
        title={t`action.open`}
        onConfirm={({ pickedPath }) => {
          setForm({ ...form, path: pickedPath })
          setPickerShow(false)
        }}
        onCancel={() => setPickerShow(false)}
      />
    </>
  )
}
