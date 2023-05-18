import { ReactNode, useCallback } from 'react'
import { IEntry } from '../types'
import { getEntryPath } from '../utils'
import { Confirmor, SvgIcon } from './base'
import { useTranslation } from 'react-i18next'
import { useRequest } from '../hooks'
import { FsApi } from '../api'
import { useRecoilState } from 'recoil'
import { lastChangedPathState } from '../states'
import EntryNode from '../apps/FileExplorer/EntryNode'

interface DnDWrapperProps {
  entry: IEntry
  children: ReactNode
  thumbnailSupported: boolean
  dropOnly?: boolean
  disabled?: boolean
  className?: string
}

export default function DnDWrapper(props: DnDWrapperProps) {

  const {
    entry,
    children,
    thumbnailSupported,
    dropOnly = false,
    disabled = false,
    className = '',
  } = props

  const { t } = useTranslation()

  const [, setLastUploadedPath] = useRecoilState(lastChangedPathState)

  const { request: renameEntry } = useRequest(FsApi.renameEntry)

  const handleDragStart = useCallback((e: any) => {
    if (dropOnly) return
    e.dataTransfer.setData('text/plain', JSON.stringify(entry))
  }, [entry, dropOnly])

  const handleDrop = useCallback((e: any) => {
    e.preventDefault()
    if (entry.type !== 'directory') return

    const transferData = e.dataTransfer.getData('text/plain')
    if (!transferData) return

    e.stopPropagation()

    const originEntry = JSON.parse(transferData) as IEntry
    const from = getEntryPath(originEntry)
    const to = `${getEntryPath(entry)}/${originEntry.name}`

    Confirmor({
      type: 'tip',
      content: (
        <>
          <div className="flex items-center">
            <EntryNode
              gridMode
              hideApp
              defaultViewable
              entry={originEntry}
              thumbnailSupported={thumbnailSupported}
            />
            <SvgIcon.ArrowRight size={24} />
            <EntryNode
              gridMode
              hideApp
              defaultViewable
              entry={entry}
              thumbnailSupported={thumbnailSupported}
            />
          </div>
        </>
      ),
      t,
      onConfirm: async (close) => {
        const { success } = await renameEntry(from, to)
        if (success) {
          setLastUploadedPath({ path: originEntry.parentPath, timestamp: Date.now() })
          close()
        }
      },
    })
  }, [entry, t, renameEntry, setLastUploadedPath, thumbnailSupported])

  return (
    <div
      draggable={!disabled}
      className={`gagu-dnd-wrapper ${className || 'inline-block'}`}
      onDragStart={handleDragStart}
      onDragOver={(e: any) => e.preventDefault()}
      // TODO: remove capture
      onDropCapture={handleDrop}
    >
      {children}
    </div>
  )
}
