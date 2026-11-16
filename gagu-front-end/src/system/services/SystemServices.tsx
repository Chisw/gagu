import { ReactNode } from 'react'
import { UploadService } from './upload/UploadService'

export function SystemServices({ children }: { children: ReactNode }) {
  return (
    <UploadService>
      {children}
    </UploadService>
  )
}
