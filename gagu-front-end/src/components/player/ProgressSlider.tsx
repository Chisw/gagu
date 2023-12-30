import { Duration } from 'luxon'
import { useCallback, useMemo, useState } from 'react'
import { line } from '../../utils'

interface ProgressSliderProps {
  duration: number
  playPercent: number
  frontAndBackColorClassNames: string[]
  maxUnit?: 'MIN' | 'H'
  onProgressClick: (ratio: number) => void
}

export function ProgressSlider(props: ProgressSliderProps) {

  const {
    duration,
    playPercent,
    maxUnit = 'MIN',
    frontAndBackColorClassNames: [frontColor, backColor],
    onProgressClick,
  } = props

  const { format, defaultLabel } = useMemo(() => {
    const isHour = maxUnit === 'H'
    const format = `${isHour ? 'hh:' : ''}mm:ss`
    const defaultLabel = `${isHour ? '00:' : ''}00:00`
    return { format, defaultLabel }
  }, [maxUnit])

  const [timeLabelData, setTimeLabelData] = useState<{ distance: number, label: string }>({
    distance: 0,
    label: defaultLabel,
  })

  const handleProgressClick = useCallback((event: any) => {
    const { target, clientX } = event
    const { x, width } = target.getBoundingClientRect()
    const distance = clientX - x
    const ratio = distance / width
    onProgressClick(ratio)
  }, [onProgressClick])

  const handleMouseMoveProgressBar = useCallback((event: any) => {
    const { target, clientX } = event
    const { x, width } = target.getBoundingClientRect()
    const distance = clientX - x
    const ratio = distance / width
    const label = Duration.fromMillis(duration * ratio * 1000).toFormat(format)
    setTimeLabelData({ distance, label })
  }, [duration, format])

  return (
    <>
      <div className="hover-show-parent relative z-10 w-full h-[2px] flex-shrink-0">
        <div
          className={line(`
            hover-show-child
            opacity-0 md:opacity-100
            absolute top-0 -mt-5 px-1 h-4 bg-black
            text-white font-din text-xs text-center rounded-sm
            scale-90 -translate-x-1/2
          `)}
          style={{ left: `${timeLabelData.distance}px` }}
        >
          <div className="absolute z-0 left-1/2 bottom-0 -mb-[2px] w-2 h-2 bg-black -translate-x-1/2 rotate-45 rounded-sm" />
          <span className="relative ">{timeLabelData.label}</span>
        </div>

        <div
          className="absolute z-10 top-0 right-0 left-0 -mt-2 h-4 cursor-pointer"
          onClick={handleProgressClick}
          onMouseMove={handleMouseMoveProgressBar}
        />

        <div className={`absolute bottom-0 right-0 left-0 h-[2px] ${backColor}`}>
          <div
            className={`h-full ${frontColor}`}
            style={{ width: `${playPercent}%` }}
          >
            <div
              className="absolute -mt-[3px] -ml-1 w-2 h-2 rounded bg-white shadow"
              style={{ left: `${playPercent}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
