import { useRef } from 'react'
import { useClickAway } from '../hooks'
import { line } from '../utils'

interface VolumeSliderProps {
  show: boolean
  volume: number
  right?: number
  bottom?: number,
  onClose: () => void
  onVolumeChange: (vol: number) => void
}

export default function VolumeSlider(props: VolumeSliderProps) {

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
          absolute z-10
          w-8 h-32 rounded bg-black shadow-md
          ${show ? 'block' : 'hidden'}
        `)}
        style={{ right, bottom }}
      >
        <input
          type="range"
          className="gg-volume-slider"
          step={.01}
          min={0}
          max={1}
          value={volume}
          onChange={(e: any) => onVolumeChange(+e.target.value)}
        />
        <div className="absolute bottom-0 mb-1 w-full text-center text-white text-xs font-din transform scale-90">
          {(volume * 100).toFixed(0)}%
        </div>
      </div>
    </>
  )
}
