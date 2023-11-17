import { DateTime } from 'luxon'
import { IEntry, IEntryPathMap } from '../../types'
import { getEntryPath, getReadableSize, line } from '../../utils'
import EntryIcon from '../../apps/FileExplorer/EntryNode/EntryIcon'
import { useEffect, useRef, useState } from 'react'
import { SvgIcon } from '../../components/base'

interface EntryNodeProps {
  entry: IEntry
  isSelected?: boolean
  isFavorited?: boolean
  gridMode: boolean
  isSelectionMode: boolean
  hideAppIcon?: boolean
  supportThumbnail?: boolean
  entryPathMap?: IEntryPathMap
  scrollHook?: { top: number, height: number }
  requestState?: {
    sizeQuerying: boolean
    deleting: boolean
  }
  onClick?: (e: any, entry: IEntry) => void
}

export default function EntryNode(props: EntryNodeProps) {
  const {
    entry,
    isSelected = false,
    isFavorited = false,
    gridMode,
    isSelectionMode,
    hideAppIcon = false,
    supportThumbnail = false,
    entryPathMap = {},
    scrollHook,
    requestState,
    onClick = () => {},
  } = props

  const { name, type, extension, hidden, size, lastModified } = entry
  const path = getEntryPath(entry)
  const bytes = size === undefined ? entryPathMap[path]?.size : size
  const sizeLabel = bytes === undefined ? '--' : getReadableSize(bytes)
  const dateLabel = lastModified ? DateTime.fromMillis(lastModified).toFormat('yyyy-MM-dd HH:mm') : ''

  const [isViewable, setIsViewable] = useState(false)

  const nodeRef = useRef<any>(null)

  useEffect(() => {
    const icon: any = nodeRef.current
    if (!icon || !scrollHook) return
    const { top, height } = scrollHook
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsViewable(true)
    }
  }, [scrollHook])

  return (
    <div
      ref={nodeRef}
      data-entry-name={name}
      data-entry-type={type}
      data-entry-extension={extension}
      data-selected={isSelected}
      className={line(`
        gagu-entry-node
        relative overflow-hidden
        px-1 py-2
        active:scale-90 transition-transform duration-200
        ${hidden ? 'opacity-50' : ''}
        ${gridMode ? ' w-1/4' : 'w-full flex items-center'}
        ${isSelected && requestState?.deleting ? 'bg-loading' : ''}
      `)}
      onClick={e => onClick(e, entry)}
    >
      <EntryIcon {...{ isSmall: false, isFavorited, isViewable, entry, hideAppIcon, supportThumbnail }} />

      <div
        className={line(`
          text-xs
          ${gridMode ? 'text-center' : ''}
        `)}
      >
        {entry.name}
      </div>

      <div
        className={line(`
          text-xs whitespace-nowrap font-din
          ${gridMode ? 'hidden' : ''}
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
        `)}
      >
        {dateLabel}
      </div>
      <div
        className={line(`
          text-xs whitespace-nowrap font-din min-w-16
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
          ${gridMode ? 'w-full text-center' : 'pl-2 w-24 text-right'}
          ${(isSelected && requestState?.sizeQuerying) ? 'bg-loading' : ''}
        `)}
      >
        {sizeLabel}
      </div>

      {isSelectionMode && (
        <div
          className={line(`
            absolute top-1/2 left-1/2
            w-4 h-4 rounded-full text-white
            flex justify-center items-center
            ${gridMode ? 'translate-x-1/2 -translate-y-1/2' : ''}
            ${isSelected ? 'bg-blue-500' : 'bg-black bg-opacity-20 border border-gray-200'}
          `)}
        >
          <SvgIcon.Check className={isSelected ? '' : 'hidden'} size={14} />
        </div>
      )}
    </div>
  )
}
