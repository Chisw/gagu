import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'
import { line } from '../utils'

interface ProgressSliderProps {
  duration: number
  playPercent: number
  frontAndBackColorClassNames: string[]
  onProgressClick: (ratio: number) => void
}

export default function ProgressSlider(props: ProgressSliderProps) {

  const {
    duration,
    playPercent,
    frontAndBackColorClassNames: [frontColor, backColor],
    onProgressClick,
  } = props

  const [timeLabelData, setTimeLabelData] = useState<{ show: boolean, left: number, label: string }>({
    show: false,
    left: 0,
    label: '',
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
    const percent = distance / width
    const label = DateTime.fromSeconds(duration * percent).toFormat('mm:ss')
    setTimeLabelData({ show: true, left: distance, label })
  }, [duration])

  return (
    <>
      <div className="relative z-10 w-full h-2px flex-shrink-0">
        <div
          className={line(`
            absolute top-0 -mt-5 w-8 h-4 bg-black
            text-white font-din text-xs text-center rounded-sm
            transform scale-90 -translate-x-1/2
            ${timeLabelData.show ? 'block' : 'hidden'}
          `)}
          style={{ left: `${timeLabelData.left}px` }}
        >
          <div className="absolute z-0 left-1/2 bottom-0 -mb-2px w-2 h-2 bg-black transform -translate-x-1/2 rotate-45 rounded-sm" />
          <span className="relative ">{timeLabelData.label}</span>
        </div>

        <div
          className="absolute z-10 top-0 right-0 left-0 -mt-2 h-4 cursor-pointer"
          onClick={handleProgressClick}
          onMouseEnter={() => setTimeLabelData({ show: true, left: 0, label: '' })}
          onMouseLeave={() => setTimeLabelData({ show: false, left: 0, label: '' })}
          onMouseMove={handleMouseMoveProgressBar}
        />

        <div className={`absolute bottom-0 right-0 left-0 transform h-2px ${backColor}`}>
          <div
            className={`h-full ${frontColor}`}
            style={{ width: `${playPercent}%` }}
          >
            <div
              className="absolute -mt-3px -ml-1 w-2 h-2 rounded bg-white shadow"
              style={{ left: `${playPercent}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
