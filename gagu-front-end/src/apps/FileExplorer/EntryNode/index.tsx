import { CSSProperties } from 'react'
import { ClipboardState, CreationType, NameFailType } from '../../../types'
import { IEntry } from '@shared'
import { getEntryLabels, line } from '../../../utils'
import EntryIcon from './EntryIcon'
import EntryName from './EntryName'

interface EntryNodeProps {
  entry: IEntry
  kiloSize: 1000 | 1024
  gridMode: boolean
  className?: string
  style?: CSSProperties
  isSelected?: boolean
  isFavorited?: boolean
  isEven?: boolean
  inputMode?: boolean
  draggable?: boolean
  hideAppIcon?: boolean
  supportThumbnail?: boolean
  creationType?: CreationType
  requestState?: {
    sizeQuerying: boolean
    deleting: boolean
  }
  clipboardState?: ClipboardState
  onClick?: (e: any, entry: IEntry) => void
  onDoubleClick?: (entry: IEntry) => void
  onNameSuccess?: (entry: IEntry) => void
  onNameFail?: (failType: NameFailType) => void
}

export default function EntryNode(props: EntryNodeProps) {
  const {
    entry,
    kiloSize,
    gridMode,
    className,
    style,
    isSelected = false,
    isFavorited = false,
    isEven = false,
    inputMode = false,
    draggable = false,
    hideAppIcon = false,
    supportThumbnail = false,
    creationType,
    requestState,
    clipboardState,
    onClick = () => {},
    onDoubleClick = () => {},
    onNameSuccess = () => {},
    onNameFail = () => {},
  } = props

  const { name, type, parentPath, extension, hidden } = entry
  const { sizeLabel, dateLabel } = getEntryLabels(entry, kiloSize)

  return (
    <div
      draggable={draggable}
      title={name}
      data-entry-name={name}
      data-entry-type={type}
      data-entry-extension={extension}
      data-selected={isSelected}
      className={line(`
        gagu-entry-node
        relative overflow-hidden group
        transition-opacity duration-300
        clipboard-${clipboardState}
        ${hidden ? 'opacity-50' : ''}
        ${isSelected ? 'is-selected' : ''}
        ${gridMode ? 'is-grid-mode px-1 py-2 w-28 h-29 rounded-xs' : 'is-list-mode px-3 flex items-center'}
        ${isSelected && !gridMode ? 'bg-blue-600' : ''}
        ${isSelected && gridMode ? 'bg-black/5 dark:bg-black/20' : ''}
        ${isSelected && requestState?.deleting ? 'bg-loading' : ''}
        ${!isSelected && !gridMode && isEven ? 'bg-black/2 dark:bg-white/2' : ''}
        ${!isSelected && !hideAppIcon ? 'hover:bg-black/5 dark:hover:bg-white/5' : ''}
        ${className}
      `)}
      style={style}
      onClick={e => onClick(e, entry)}
      onDoubleClick={() => onDoubleClick(entry)}
    >
      <EntryIcon
        {...{
          isSmall: !gridMode,
          isFavorited,
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
          shrink-0
          gagu-entry-node-size
          text-xs whitespace-nowrap font-din min-w-16 pointer-events-none
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
          shrink-0
          text-xs whitespace-nowrap font-din pointer-events-none
          ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
          ${gridMode ? 'hidden' : 'w-36 pl-2 text-right'}
        `)}
      >
        {dateLabel}
      </div>
    </div>
  )
}
