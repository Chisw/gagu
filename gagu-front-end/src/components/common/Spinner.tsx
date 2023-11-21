import { SvgIcon } from './SvgIcon'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner(props: SpinnerProps) {
  const {
    size = 16,
    className = '',
  } = props

  return (
    <div className={`inline-block ${className} text-gray-400 animate-spin`}>
      <SvgIcon.Loader size={size} />
    </div>
  )
}
