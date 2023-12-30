import { ReactNode } from 'react'
import { line } from '../../utils'

interface IconButtonProps {
  icon: ReactNode
  onClick: () => void
  size?: 'xs' | 'sm' | 'lg' | 'xl'
  className?: string
  title?: string
  disabled?: boolean
}

export function IconButton(props: IconButtonProps) {
  const {
    icon,
    onClick,
    size = 'base',
    className = '',
    title = '',
    disabled = false,
  } = props

  const sizeClassName = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    base: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size]

  return (
    <>
      <div
        title={title}
        className={line(`
          ${className}
          ${sizeClassName}
          inline-flex justify-center items-center
          rounded-sm text-white
          transition-bg duration-100
          ${disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer md:hover:bg-white md:hover:bg-opacity-20 active:bg-white active:bg-opacity-10'
          }
        `)}
        onClick={() => !disabled && onClick()}
      >
        {icon}
      </div>
    </>
  )
}
