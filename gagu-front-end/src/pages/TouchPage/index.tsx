import { Button } from '@douyinfe/semi-ui'
import { useNavigate } from 'react-router-dom'
import { SvgIcon } from '../../components/base'

export default function TouchPage() {
  const navigate = useNavigate()

  return (
    <>
      <div className="p-8">
        <div>⏳ Touch mode in coding...</div>
        <Button className="mt-4" theme="solid" onClick={() => navigate(-1)} icon={<SvgIcon.ArrowLeft />}>Back</Button>
      </div>
    </>
  )
}
