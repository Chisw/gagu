import { useRef } from 'react'
import { useClickAway } from '../../hooks'
import { line } from '../../utils'

interface VolumeSliderProps {
  show: boolean
  volume: number
  right?: number
  bottom?: number,
  onClose: () => void
  onVolumeChange: (vol: number) => void
}

export function VolumeSlider(props: VolumeSliderProps) {

  const {
    show,
    volume,
    right = 0,
    bottom = 0,
    onClose,
    onVolumeChange,
  } = props

  const sliderRef = useRef(null)
  
  useClickAway(sliderRef, onClose)

  return (
    <>
      <div
        ref={sliderRef}
        className={line(`
          absolute z-20
          w-8 h-32 rounded bg-black shadow-lg border border-white border-opacity-20
          ${show ? 'block' : 'hidden'}
        `)}
        style={{ right, bottom }}
      >
        <div className="absolute top-[2px] w-full text-center text-white text-xs font-din scale-90">
          {(volume * 100).toFixed(0)}%
        </div>
        <input
          type="range"
          className="gagu-volume-slider"
          step={.01}
          min={0}
          max={1}
          value={volume}
          onChange={(e: any) => onVolumeChange(+e.target.value)}
        />
      </div>
    </>
  )
}
