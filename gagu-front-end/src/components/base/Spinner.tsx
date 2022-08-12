import RemixIcon from '../../img/remixicon'

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
      <RemixIcon.Loader size={size} />
    </div>
  )
}
