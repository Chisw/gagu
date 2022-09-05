import { useMemo } from 'react'
import { FsApi } from '../../api'
import { IEntry } from '../../types'
import { line } from '../../utils'

interface ThumbnailListProps {
  show: boolean
  activeIndex: number
  matchedEntryList: IEntry[]
  windowWidth: number
  onClick: (index: number) => void
}

export default function ThumbnailList(props: ThumbnailListProps) {

  const {
    show,
    activeIndex,
    matchedEntryList,
    windowWidth,
    onClick,
  } = props

  const left = useMemo(() => {
    const width = 48  // width 40 + margin 4 * 2
    const activeEntryCenterPoint = activeIndex * width + width / 2
    const left = windowWidth / 2 - activeEntryCenterPoint
    return left
  }, [windowWidth, activeIndex])

  return (
    <div
      className={line(`
        relative bg-gray-800 flex-shrink-0
        transition-height duration-200 overflow-hidden
        ${show ? 'h-12' : 'h-0'}
      `)}
    >
      <div
        className="absolute mt-1 flex justify-center items-center transition-spacing duration-300"
        style={{ left }}
      >
        {show && matchedEntryList.map((entry, entryIndex) => {
          const src = FsApi.getThumbnailUrl(entry)
          const entryName = entry.name
          const isActive = entryIndex === activeIndex
          return (
            <div
              key={entryName}
              className={line(`
                mx-1 w-10 h-10 cursor-pointer border-2 flex-shrink-0
                bg-center bg-no-repeat bg-cover
                ${isActive ? 'border-orange-500' : 'border-transparent hover:border-orange-700'}
              `)}
              style={{ backgroundImage: `url("${src}")` }}
              onClick={() => onClick(matchedEntryList.findIndex(en => en.name === entryName))}
            />
          )
        })}
      </div>
    </div>
  )
}
