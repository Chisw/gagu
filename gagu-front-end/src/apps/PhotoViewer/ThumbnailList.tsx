import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
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

const ITEM_WIDTH = 48  // width 40 + margin 4 * 2

export default function ThumbnailList(props: ThumbnailListProps) {

  const {
    show,
    activeIndex,
    matchedEntryList,
    windowWidth,
    onClick,
  } = props

  const [wheelOffset, setWheelOffset] = useState(0)

  useEffect(() => setWheelOffset(0), [activeIndex])

  const { totalScrollWidth, left, startIndex, endIndex, isToLeft, isToRight } = useMemo(() => {
    const totalScrollWidth = matchedEntryList.length * ITEM_WIDTH
    const halfWindowWidth = windowWidth / 2
    const minLeft = - (totalScrollWidth - halfWindowWidth)
    const maxLeft = halfWindowWidth
    const activeEntryCenterPoint = activeIndex * ITEM_WIDTH + ITEM_WIDTH / 2
    // default left on active item
    let left = halfWindowWidth - activeEntryCenterPoint

    if (wheelOffset !== 0) {
      left = left - wheelOffset
    }

    left = Math.max(left, minLeft)
    left = Math.min(left, maxLeft)

    const isToLeft = left === maxLeft
    const isToRight = left === minLeft
    const inViewCount = Math.ceil(windowWidth / ITEM_WIDTH)
    const startIndex = -Math.ceil(left / ITEM_WIDTH)
    const endIndex = startIndex + inViewCount

    return { totalScrollWidth, left, startIndex, endIndex, isToLeft, isToRight }
  }, [windowWidth, activeIndex, matchedEntryList, wheelOffset])

  const handleMouseWheel = useCallback((e: any) => {
    const slowDownTimes = 4
    const delta = e.deltaY / slowDownTimes
    const canGoLeft = !isToLeft && delta < 0
    const canGoRight = !isToRight && delta > 0
    if (canGoLeft || canGoRight) {
      setWheelOffset(wheelOffset + delta)
    }
  }, [wheelOffset, isToLeft, isToRight])

  return (
    <div
      className={line(`
        relative z-0 bg-gray-900 flex-shrink-0
        transition-height duration-200 overflow-hidden
        ${show ? 'h-12' : 'h-0'}
      `)}
      onWheel={handleMouseWheel}
    >
      <div
        className="absolute h-full flex justify-center items-center transition-spacing duration-300 bg-white bg-opacity-10"
        style={{
          left,
          width: totalScrollWidth,
        }}
      >
        {show && matchedEntryList.map((entry, entryIndex) => {
          const src = FsApi.getThumbnailStreamUrl(entry)
          const entryName = entry.name
          const isActive = entryIndex === activeIndex
          if (startIndex <= entryIndex && entryIndex <= endIndex) {
            return (
              <div
                key={entryName}
                className={line(`
                  absolute top-0
                  mx-1 mt-1 w-10 h-10 border-2 bg-clip-padding
                  flex-shrink-0 cursor-pointer
                  bg-center bg-no-repeat bg-cover
                  ${isActive ? 'border-orange-500' : 'border-transparent hover:border-orange-700'}
                `)}
                style={{
                  backgroundImage: `url("${src}")`,
                  left: entryIndex * ITEM_WIDTH,
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
