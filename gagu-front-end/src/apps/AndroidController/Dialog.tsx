import { Button, Input, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import toast from 'react-hot-toast'
import { IDialogForm } from '../../types'

const widgetList = [
  'confirm',
  'checkbox',
  'counter',
  'date',
  'radio',
  'sheet',
  'spinner',
  'speech',
  'text',
  'time',
]

export default function Dialog() {

  const [form, setForm] = useState<IDialogForm>({
    widget: 'confirm',
    title: '',
    hint: '',
    values: '',
    range: '',
    dateFormat: '',
    multiple: false,
    inputType: undefined,
  })

  const { request: createDialog, loading: creating } = useRequest(TermuxApi.createDialog)

  const handleDialog = useCallback(async () => {
    const { success } = await createDialog(form)
    if (success) {
      toast.success('OK')
    }
  }, [createDialog, form])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <div>
          <RadioGroup
            value={form.widget}
            onChange={(e) => setForm({ ...form, widget: e.target.value })}
          >
            {widgetList.map((widget) => (
              <Radio
                key={widget}
                value={widget}
                children={widget}
              />
            ))}
          </RadioGroup>
        </div>
        <Input
          placeholder="Title"
          className="mt-2"
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />
        <Input
          placeholder="Hint"
          className="mt-2"
          value={form.hint}
          onChange={hint => setForm({ ...form, hint })}
        />
        <Input
          placeholder="Values"
          className="mt-2"
          value={form.values}
          onChange={values => setForm({ ...form, values })}
        />
        <Input
          placeholder="Range"
          className="mt-2"
          value={form.range}
          onChange={range => setForm({ ...form, range })}
        />
        <Input
          placeholder="Date format"
          className="mt-2"
          value={form.dateFormat}
          onChange={dateFormat => setForm({ ...form, dateFormat })}
        />
        <div className="py-2">
          <RadioGroup
            value={form.inputType}
            onChange={(e) => setForm({ ...form, inputType: e.target.value })}
          >
            {[undefined, 'number', 'password'].map((type, typeIndex) => (
              <Radio
                key={typeIndex}
                value={type}
                children={type}
              />
            ))}
          </RadioGroup>
        </div>
        <Button
          className="mt-2"
          loading={creating}
          onClick={handleDialog}
        >
          Dialog
        </Button>
      </div>
    </>
  )
}
