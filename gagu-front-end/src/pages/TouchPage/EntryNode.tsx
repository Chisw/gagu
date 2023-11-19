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
        transition-transform duration-200
        ${hidden ? 'opacity-50' : ''}
        ${isSelected && requestState?.deleting ? 'bg-loading' : ''}
        ${gridMode
          ? 'py-2 w-1/4 md:w-[12.5%] lg:w-1/12 active:scale-90'
          : 'px-2 py-3 w-full flex justify-start items-center active:scale-95'
        }
      `)}
      onClick={e => onClick(e, entry)}
    >
      {gridMode ? (
        <>
          <EntryIcon
            touchMode
            {...{ isSmall: false, isFavorited, isViewable, entry, hideAppIcon, supportThumbnail }}
          />
          <div className="text-center text-xs">
            {entry.name}
          </div>
          <div
            className={line(`
              w-full min-w-16
              text-center text-xs whitespace-nowrap font-din text-gray-400
              ${(isSelected && requestState?.sizeQuerying) ? 'bg-loading' : ''}
            `)}
          >
            {sizeLabel}
          </div>
        </>
      ) : (
        <>
          <div className="w-14">
            <EntryIcon
              touchMode
              {...{ isSmall: false, isFavorited, isViewable, entry, hideAppIcon, supportThumbnail }}
            />
          </div>
          <div className="pl-2">
            <div className="text-sm">
              {entry.name}
            </div>
            <div>
              <div
                className={line(`
                  w-full min-w-16
                  text-xs whitespace-nowrap font-din text-gray-400
                  ${(isSelected && requestState?.sizeQuerying) ? 'bg-loading' : ''}
                `)}
              >
                {dateLabel} &nbsp;|&nbsp; {sizeLabel}
              </div>
            </div>
          </div>
        </>
      )}

      {isSelectionMode && (
        <div
          className={line(`
            absolute z-10 
            rounded-full text-white
            flex justify-center items-center
            ${isSelected ? 'bg-blue-500' : 'bg-black bg-opacity-20 border border-gray-200'}
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
