import { ReactNode } from 'react'
interface DesktopProps {
  children: ReactNode
}

export default function Desktop(props: DesktopProps) {
  return (
    <>
      <div
        className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-900"
      >
        {props.children}
      </div>
    </>
  )
}
