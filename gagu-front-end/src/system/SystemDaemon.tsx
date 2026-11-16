import { ReactNode } from 'react'
import { SystemServices } from './services/SystemServices'

// Coordinates service lifetimes; individual services own their business logic.
export function SystemDaemon({ children }: { children: ReactNode }) {
  return (
    <SystemServices>
      {children}
    </SystemServices>
  )
}
