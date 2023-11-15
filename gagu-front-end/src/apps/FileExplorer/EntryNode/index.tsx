import { DateTime } from 'luxon'
import { IEntry, IEntryPathMap } from '../../../types'
import { getEntryPath, getReadableSize, line } from '../../../utils'
import EntryIcon from './EntryIcon'
import EntryName, { NameCreationType, NameFailType } from './EntryName'
import { useEffect, useRef, useState } from 'react'

interface EntryNodeProps {
  entry: IEntry
  isSelected?: boolean
  isFavorited?: boolean
  gridMode: boolean
  creationMode?: boolean
  renameMode?: boolean
  hideApp?: boolean
  supportThumbnail?: boolean
  creationType?: NameCreationType
  entryPathMap?: IEntryPathMap
  scrollHook?: { top: number, height: number }
  requestState?: {
    sizeQuerying: boolean
    deleting: boolean
  }
  onClick?: (e: any, entry: IEntry) => void
  onDoubleClick?: (entry: IEntry) => void
  onNameSuccess?: (entry: IEntry) => void
  onNameFail?: (failType: NameFailType) => void
}

export default function EntryNode(props: EntryNodeProps) {
  const {
    entry,
    isSelected = false,
    isFavorited = false,
    gridMode,
    creationMode = false,
    renameMode = false,
    hideApp = false,
    supportThumbnail = false,
    creationType,
    entryPathMap = {},
    scrollHook,
    requestState,
    onClick = () => {},
    onDoubleClick = () => {},
    onNameSuccess = () => {},
    onNameFail = () => {},
  } = props

  const { name, type, parentPath, extension, hidden, size, lastModified } = entry
  const isSmall = !gridMode
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
      draggable
      ref={nodeRef}
      data-entry-name={name}
      data-entry-type={type}
      data-entry-extension={extension}
      data-selected={isSelected}
      className={line(`
        gagu-entry-node
        relative overflow-hidden group
        ${hidden ? 'opacity-50' : ''}
        ${gridMode ? 'm-1 px-1 py-2 w-28 rounded-sm' : 'px-3 py-[3px] w-full flex items-center'}
        ${isSelected && !gridMode ? 'bg-blue-600' : ''}
        ${isSelected && gridMode ? 'bg-gray-100' : ''}
        ${isSelected && requestState?.deleting ? 'bg-loading' : ''}
        ${!isSelected && !gridMode ? 'even:bg-black even:bg-opacity-[2%]' : ''}
        ${!isSelected && !hideApp ? 'hover:bg-gray-100' : ''}
      `)}
      onClick={e => onClick(e, entry)}
      onDoubleClick={() => onDoubleClick(entry)}
    >
      <EntryIcon {...{ isSmall, isFavorited, isViewable, entry, hideApp, supportThumbnail }} />

      <EntryName
        inputMode={(renameMode && isSelected) || creationMode}
        entry={entry}
        creationType={creationType}
        isSelected={isSelected}
        gridMode={gridMode}
        parentPath={parentPath}
        onSuccess={onNameSuccess}
        onFail={onNameFail}
      />
      <div
        className={line(`
          text-xs whitespace-nowrap font-din min-w-16
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
          ${gridMode ? 'w-full text-center' : 'pl-2 w-24 text-right'}
          ${(isSelected && requestState?.sizeQuerying) ? 'bg-loading' : ''}
        `)}
        // style={{ textShadow: '0 1px #fff, 1px 0 #fff, -1px 0 #fff, 0 -1px #fff' }}
      >
        {sizeLabel}
      </div>
      <div
        className={line(`
          text-xs whitespace-nowrap font-din
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
          ${gridMode ? 'hidden' : 'w-36 pl-2 text-right'}
        `)}
      >
        {dateLabel}
      </div>
    </div>
  )
}
