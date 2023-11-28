import { CreationType, IEntry, IScrollerWatcher, NameFailType } from '../../../types'
import { getEntryLabels, line } from '../../../utils'
import EntryIcon from './EntryIcon'
import EntryName from './EntryName'
import { useEffect, useRef, useState } from 'react'

interface EntryNodeProps {
  entry: IEntry
  gridMode: boolean
  isSelected?: boolean
  isFavorited?: boolean
  inputMode?: boolean
  draggable?: boolean
  hideAppIcon?: boolean
  supportThumbnail?: boolean
  creationType?: CreationType
  thumbScrollWatcher?: IScrollerWatcher
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
    gridMode,
    isSelected = false,
    isFavorited = false,
    inputMode = false,
    draggable = false,
    hideAppIcon = false,
    supportThumbnail = false,
    creationType,
    thumbScrollWatcher,
    requestState,
    onClick = () => {},
    onDoubleClick = () => {},
    onNameSuccess = () => {},
    onNameFail = () => {},
  } = props

  const { name, type, parentPath, extension, hidden } = entry
  const { sizeLabel, dateLabel } = getEntryLabels(entry)

  const [isViewable, setIsViewable] = useState(false)

  const nodeRef = useRef<any>(null)

  useEffect(() => {
    const icon: any = nodeRef.current
    if (!icon || !thumbScrollWatcher) return
    const { top, height } = thumbScrollWatcher
    const { top: iconTop } = icon.getBoundingClientRect()
    if ((top - 20) <= iconTop && iconTop <= (top + height)) {
      setIsViewable(true)
    }
  }, [thumbScrollWatcher])

  return (
    <div
      draggable={draggable}
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
        ${!isSelected && !hideAppIcon ? 'hover:bg-gray-100' : ''}
      `)}
      onClick={e => onClick(e, entry)}
      onDoubleClick={() => onDoubleClick(entry)}
    >
      <EntryIcon
        {...{
          isSmall: !gridMode,
          isFavorited,
          isViewable,
          entry,
          hideAppIcon,
          supportThumbnail,
        }}
      />

      <EntryName
        inputMode={inputMode}
        {...{
          entry,
          creationType,
          isSelected,
          gridMode,
          parentPath, 
        }}
        onSuccess={onNameSuccess}
        onFail={onNameFail}
      />
      <div
        className={line(`
          text-xs whitespace-nowrap font-din min-w-16
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
          ${gridMode ? 'w-full text-center' : 'pl-2 w-24 text-right'}
          ${(isSelected && requestState?.sizeQuerying) ? 'bg-loading' : ''}
          ${inputMode ? 'hidden' : ''}
        `)}
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
