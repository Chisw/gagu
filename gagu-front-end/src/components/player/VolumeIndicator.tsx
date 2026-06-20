import { useEffect, useState } from 'react'
import { line } from '../../utils'
import { VolumeIcon } from './VolumeIcon'

interface VolumeIndicatorProps {
  volume: number
  time: number
}

export function VolumeIndicator({ volume, time }: VolumeIndicatorProps) {

  const [visible, setVisible] = useState(false)
  const [opacityShow, setOpacityShow] = useState(false)

  useEffect(() => {
    if (!time) return
    let timer: number
    let opacityTimer: number
    setVisible(true)
    setOpacityShow(true)
    timer = setTimeout(() => {
      setOpacityShow(false)
      opacityTimer = setTimeout(() => setVisible(false), 300)
    }, 500)
    return () => {
      clearTimeout(timer)
      clearTimeout(opacityTimer)
    }
  }, [volume, time])

  return (
    <div
      className={line(`
        absolute z-20 top-1/2 left-1/2
        -translate-x-1/2 -translate-y-1/2
        w-24 h-24 bg-black/30 rounded-lg
        font-din text-base text-white backdrop-blur-sm
        flex-center-center
        transition-opacity duration-300
        ${visible ? 'block' : 'hidden'}
        ${opacityShow ? 'opacity-100' : 'opacity-0'}
      `)}
    >
      <div>
        <VolumeIcon volume={volume} size={32} />
        <div className="mt-1 text-center">
          {(volume * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}
