import { CSSProperties } from 'react'
import { EntryType, IEntry } from '@shared'
import { getEntryLabels, line } from '../../utils'
import EntryIcon from '../FileExplorer/EntryNode/EntryIcon'
import { SvgIcon } from '../../components/common'
import { IApiState } from '../../types'

interface EntryNodeProps {
  entry: IEntry
  kiloSize: 1000 | 1024
  isSelected?: boolean
  isFavorited?: boolean
  gridMode: boolean
  className?: string
  style?: CSSProperties
  isSelectionMode: boolean
  hideAppIcon?: boolean
  supportThumbnail?: boolean
  apiState?: IApiState
  onClick?: (entry: IEntry) => void
}

export default function EntryNode(props: EntryNodeProps) {
  const {
    entry,
    kiloSize,
    isSelected = false,
    isFavorited = false,
    gridMode,
    className,
    style,
    isSelectionMode,
    hideAppIcon = false,
    supportThumbnail = false,
    apiState,
    onClick = () => {},
  } = props

  const { name, type, extension, hidden } = entry
  const { sizeLabel, dateLabel } = getEntryLabels(entry, kiloSize)

  return (
    <div
      data-entry-name={name}
      data-entry-type={type}
      data-entry-extension={extension}
      data-selected={isSelected}
      className={line(`
        gagu-entry-node
        relative overflow-hidden
        transition-transform duration-200
        ${hidden ? 'opacity-50' : ''}
        ${isSelected && apiState?.entryDeleting ? 'bg-loading' : ''}
        ${gridMode
          ? 'px-1 py-2 active:scale-90'
          : 'px-2 py-2 flex-start-center active:scale-95'
        }
        ${className}
      `)}
      style={style}
      onClick={() => onClick(entry)}
    >
      {gridMode ? (
        <>
          <EntryIcon
            {...{
              touchMode: true,
              isSmall: false,
              isFavorited,
              entry,
              hideAppIcon,
              supportThumbnail,
            }}
          />
          <div className="text-center text-xs max-w-full line-clamp-2 dark:text-zinc-200">
            {entry.name}
          </div>
          <div
            className={line(`
              w-full min-w-16
              text-center text-xs whitespace-nowrap font-din text-gray-400
              ${(isSelected && apiState?.sizeQuerying) ? 'bg-loading' : ''}
            `)}
          >
            {sizeLabel}
          </div>
        </>
      ) : (
        <>
          <div className="w-14">
            <EntryIcon
              {...{
                touchMode: true,
                isSmall: false,
                isFavorited,
                entry,
                hideAppIcon,
                supportThumbnail,
              }}
            />
          </div>
          <div className="pl-2">
            <div className="text-sm max-w-full line-clamp-2 dark:text-zinc-200">
              {entry.name}
            </div>
            <div>
              <div
                className={line(`
                  w-full min-w-16
                  text-xs whitespace-nowrap font-din text-gray-400
                  ${(isSelected && apiState?.sizeQuerying) ? 'bg-loading' : ''}
                `)}
              >
                {dateLabel} &nbsp;|&nbsp; {sizeLabel}
              </div>
            </div>
          </div>
        </>
      )}

      {type === EntryType.directory && !isSelectionMode && !gridMode && (
        <div
          className={line(`
            absolute z-10 pointer-events-none
            rounded-full text-gray-300
            flex-center-center
            right-0 w-5 h-5 -translate-x-4 top-1/2 -translate-y-1/2
          `)}
        >
          <SvgIcon.ChevronRight size={20} />
        </div>
      )}

      {isSelectionMode && (
        <div
          className={line(`
            absolute z-10 pointer-events-none
            rounded-full text-white
            flex-center-center
            ${isSelected ? 'bg-blue-500' : 'bg-black/20 border border-gray-200'}
            ${gridMode
                ? 'top-0 left-1/2 w-4 h-4 translate-x-4 translate-y-2'
                : 'right-0 w-5 h-5 -translate-x-4 top-1/2 -translate-y-1/2'
            }
          `)}
        >
          <SvgIcon.Check className={isSelected ? '' : 'hidden'} size={14} />
        </div>
      )}
    </div>
  )
}
