import { Fragment, useMemo } from 'react'
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

const WIDTH = 48  // width 40 + margin 4 * 2

export default function ThumbnailList(props: ThumbnailListProps) {

  const {
    show,
    activeIndex,
    matchedEntryList,
    windowWidth,
    onClick,
  } = props

  const { left, startIndex, endIndex } = useMemo(() => {
    const activeEntryCenterPoint = activeIndex * WIDTH + WIDTH / 2
    const left = windowWidth / 2 - activeEntryCenterPoint
    const viewOffset = Math.ceil(windowWidth / WIDTH / 2)
    const startIndex = activeIndex - viewOffset
    const endIndex = activeIndex + viewOffset
    return { left, startIndex, endIndex }
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
          if (startIndex <= entryIndex && entryIndex <= endIndex) {
            return (
              <div
                key={entryName}
                className={line(`
                  absolute top-0
                  mx-1 w-10 h-10 border-2
                  flex-shrink-0 cursor-pointer
                  bg-center bg-no-repeat bg-cover bg-white-100
                  ${isActive ? 'border-orange-500' : 'border-transparent hover:border-orange-700'}
                `)}
                style={{
                  backgroundImage: `url("${src}")`,
                  left: entryIndex * WIDTH,
                }}
                onClick={() => onClick(matchedEntryList.findIndex(en => en.name === entryName))}
              />
            )
          } else {
            return <Fragment key={entryName}></Fragment>
          }
        })}
      </div>
    </div>
  )
}
