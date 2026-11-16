import { createContext, useContext } from 'react'
import { ExistingStrategyType } from '@shared'

interface UploadServiceState {
  uploading: boolean
  uploadInfo: { ratio: number, speed: string }
  activeId: string
  conflict: { count: number } | null
  resolveConflict: (strategy?: ExistingStrategyType) => void
  clearCompleted: () => void
}

export const UploadContext = createContext<UploadServiceState | null>(null)

export function useUploadStatus() {
  const service = useContext(UploadContext)

  if (!service) throw new Error('Upload service requires SystemServices')

  return service
}
