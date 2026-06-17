import { Button } from '@douyinfe/semi-ui'
import { useCallback } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import { Toast } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'

export default function Fingerprint() {

  const { request: queryFingerprint, loading } = useRequest(TermuxApi.queryFingerprint)

  const handleQueryFingerprint = useCallback(async () => {
    const { success } = await queryFingerprint()
    if (success) {
      Toast.success('OK')
    }
  }, [queryFingerprint])

  return (
    <>
      <div className="relative">
        <Button
          icon={<SvgIcon.Fingerprint />}
          loading={loading}
          onClick={handleQueryFingerprint}
        />
      </div>
    </>
  )
}
