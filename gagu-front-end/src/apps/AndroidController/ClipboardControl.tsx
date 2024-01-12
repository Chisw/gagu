import { Button, Input } from '@douyinfe/semi-ui'
import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import { copy } from '../../utils'
import toast from 'react-hot-toast'

export default function ClipboardControl() {

  const [value, setValue] = useState('')

  const { request: queryClipboard, loading: querying } = useRequest(TermuxApi.queryClipboard)
  const { request: updateClipboard, loading: creating } = useRequest(TermuxApi.updateClipboard)

  const handleClipboard = useCallback(async () => {
    if (value) {
      const { success } = await updateClipboard({ value })
      if (success) {
        toast.success('OK')
        setValue('')
      }
    } else {
      const { success, data } = await queryClipboard()
      if (success) {
        const { value } = data
        copy(value)
        toast.success(value)
      }
    }
  }, [updateClipboard, queryClipboard, value])

  return (
    <>
      <div className="relative flex items-center">
        <Input
          placeholder="Set content to clipboard"
          value={value}
          onChange={setValue}
        />
        <Button
          className="ml-2 w-16"
          loading={querying || creating}
          onClick={handleClipboard}
        >
          {value ? 'SET' : 'GET'}
        </Button>
      </div>
    </>
  )
}
