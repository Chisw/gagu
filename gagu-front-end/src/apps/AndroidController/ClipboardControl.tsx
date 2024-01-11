import { Button, Input } from '@douyinfe/semi-ui'
import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { AndroidApi } from '../../api'
import { copy } from '../../utils'
import toast from 'react-hot-toast'

export default function ClipboardControl() {

  const [value, setValue] = useState('')

  const { request: queryClipboard, loading } = useRequest(AndroidApi.queryClipboard)

  const handleClipboard = useCallback(async () => {
    const { success, data: { value } } = await queryClipboard()
    if (success) {
      copy(value)
      toast.success(value)
    }
  }, [queryClipboard])

  return (
    <>
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={setValue}
        />
        <Button
          className="ml-2"
          loading={loading}
          onClick={handleClipboard}
        >
          {value ? 'SET' : 'GET'}
        </Button>
      </div>
    </>
  )
}
