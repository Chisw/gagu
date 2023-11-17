import { Button } from '@douyinfe/semi-ui'
import { useNavigate } from 'react-router-dom'
import { SvgIcon } from '../../components/base'
import { useRecoilState } from 'recoil'
import { activePageState } from '../../states'
import { useEffect } from 'react'
import { Page } from '../../types'

export default function TouchPage() {
  const navigate = useNavigate()

  const [, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    setTimeout(() => setActivePage(Page.touch))
  }, [setActivePage])

  return (
    <>
      <div className="p-8">
        <div>⏳ Touch mode in coding...</div>
        <Button className="mt-4" theme="solid" onClick={() => navigate(-1)} icon={<SvgIcon.ArrowLeft />}>Back</Button>
      </div>
    </>
  )
}
