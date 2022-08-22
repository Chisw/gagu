import { ReactNode } from 'react'
interface DesktopProps {
  children: ReactNode
}

export default function Desktop(props: DesktopProps) {
  return (
    <>
      <div
        className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-tl from-yellow-300 via-orange-400 to-red-500"
      >
        {props.children}
      </div>
    </>
  )
}
