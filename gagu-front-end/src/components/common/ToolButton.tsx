import { Spinner } from '.'
import { ReactNode } from 'react'
import { line, vibrate } from '../../utils'

interface ToolButtonProps {
  title: string
  icon: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  active?: boolean
}

export function ToolButton(props: ToolButtonProps) {

  const {
    title,
    icon,
    className = '',
    onClick = () => { },
    disabled = false,
    loading = false,
    active = false,
  } = props

  return (
    <div
      title={title}
      className={line(`
        w-10 md:w-8 h-full
        flex justify-center items-center flex-shrink-0
        transition-all duration-50
        ${disabled
          ? 'cursor-not-allowed text-gray-200'
          : 'cursor-pointer bg-white text-gray-500 md:hover:text-black md:hover:bg-gray-100'
        }
        ${active ? 'outline-2 outline outline-gray-300 outline-offset-[-6px]' : ''}
        ${className}
      `)}
      onClick={() => {
        if (!disabled) {
          vibrate()
          onClick()
        }
      }}
    >
      {loading ? <Spinner size={16} /> : icon}
    </div>
  )
}
