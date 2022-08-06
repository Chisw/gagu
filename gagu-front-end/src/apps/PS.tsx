import { useEffect } from 'react'
import { AppComponentProps } from '../utils/types'

export default function PS(props: AppComponentProps) {

  const { setWindowLoading } = props

  useEffect(() => {
    setWindowLoading(true)
  }, [setWindowLoading])

  return (
    <>
      <div className="absolute inset-0">
        <iframe
          title="app"
          className="w-full h-full"
          src="https://ps.gaoding.com"
          onLoad={() => setWindowLoading(false)}
        />
      </div>
    </>
  )
}
