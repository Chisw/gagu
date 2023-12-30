import { Duration } from 'luxon'
import { useEffect, useMemo, useState } from 'react'

export interface IPlayInfo {
  currentTimeLabel: string
  durationLabel: string
  playPercent: number
}

interface usePlayInfoProps {
  el: HTMLAudioElement | HTMLVideoElement | null
  isPlaying: boolean
  maxUnit?: 'MIN' | 'H'
}

export function usePlayInfo(props: usePlayInfoProps) {
  const {
    el,
    isPlaying,
    maxUnit = 'min',
  } = props

  const { format, defaultLabel } = useMemo(() => {
    const isHour = maxUnit === 'H'
    const format = `${isHour ? 'hh:' : ''}mm:ss`
    const defaultLabel = `${isHour ? '00:' : ''}00:00`
    return { format, defaultLabel }
  }, [maxUnit])

  const [playInfo, setPlayInfo] = useState<IPlayInfo>({
    currentTimeLabel: defaultLabel,
    durationLabel: defaultLabel,
    playPercent: 0
  })

  useEffect(() => {
    let timer: any
    if (isPlaying) {
      timer = setInterval(() => {
        if (!el) return
        const { currentTime, duration } = el
        const currentTimeLabel = Duration.fromMillis((currentTime || 0) * 1000).toFormat(format)
        const durationLabel = Duration.fromMillis((duration || 0) * 1000).toFormat(format)
        const playPercent = currentTime / duration * 100
        setPlayInfo({ currentTimeLabel, durationLabel, playPercent })
      }, 100)
    } else {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [el, format, isPlaying])

  return playInfo
}
