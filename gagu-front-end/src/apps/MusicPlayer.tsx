import { Spinner, SvgIcon } from '../components/base'
import { useCallback, useEffect, useRef, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../types'
import { useFetch, useOpenOperation } from '../hooks'
import { FsApi } from '../api'
import { DateTime } from 'luxon'

const getPlayerTime = (currentTime: number, duration: number) => {
  const currentSeconds = DateTime.fromSeconds(currentTime).toFormat('mm:ss')
  const durationSeconds = DateTime.fromSeconds(duration).toFormat('mm:ss')
  return [
    `${currentSeconds}`,
    `${durationSeconds}`,
    `${currentTime / duration * 100}`,
  ]
}

export default function MusicPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props
  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.musicPlayer)

  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)
  const { fetch: getTags, data } = useFetch(FsApi.getTags)

  useEffect(() => {
    if (!audioRef || !audioRef.current) return
    const audio: any = audioRef.current
    audio.src = activeEntryStreamUrl
    audio.play()
    setIsPlaying(true)
    // setLoading(true)
  }, [activeEntryStreamUrl])

  useEffect(() => {
    if (activeEntry) {
      const { name, parentPath } = activeEntry
      getTags(`${parentPath}/${name}`)
    }
  }, [activeEntry, getTags])

  const [timeList, setTimeList] = useState<string[]>([])

  const [currentTimeStr, durationStr, percent] = timeList

  useEffect(() => {
    if (isPlaying) {
      setInterval(() => {
        if (!audioRef || !audioRef.current) return
        const audio: any = audioRef.current
        const { currentTime, duration } = audio
        setTimeList(getPlayerTime(currentTime, duration))
      }, 1000)
    }
  }, [isPlaying])


  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      // setLoading(true)
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  const handlePlayOrPause = useCallback(() => {
    if (!audioRef || !audioRef.current) return
    const audio: any = audioRef.current
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900">
        {loading && <Spinner />}
        <div className="flex-grow overflow-y-auto">
          <div className="p-2 text-xs text-pink-200">播放列表</div>
          {matchedEntryList.map((entry, entryIndex) => {
            const { name } = entry
            const isActive = entryIndex === activeIndex
            return (
              <div
                key={name}
                className="px-2 py-1 text-xs text-white cursor-pointer hover:bg-white hover:text-pink-600"
                onClick={() => setActiveIndex(entryIndex)}
              >
                <span className="mr-1 font-din">{entryIndex + 1}.</span>
                <span>{name}</span>
                <span>{isActive && <SvgIcon.Check className="inline" />}</span>
              </div>
            )
          })}
        </div>
        <div
          className="relative p-2 h-16 bg-black-200 flex justify-between items-center"
        >
          <div className="absolute top-0 right-0 left-0 -mt-2px h-2px bg-pink-200">
            <div
              className="h-full bg-pink-500"
              style={{ width: `${percent}%` }}
            >

            </div>
          </div>
          <div className="flex items-center">
            <img
              className="w-12 h-12 rounded shadow-lg"
              alt={data?.album}
              src={data?.base64}
            />
            <div className="ml-2 text-xs">
              <p className="text-pink-200">{data?.title} - {data?.artist}</p>
              <p className="text-pink-300">{data?.album}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div
              className="w-8 h-8 text-white cursor-pointer hover:bg-black-100 active:bg-black-200 flex justify-center items-center rounded"
              onClick={() => setActiveIndex(activeIndex - 1)}
            >
              <SvgIcon.SkipBack size={12} />
            </div>
            <div
              className="w-8 h-8 text-white cursor-pointer hover:bg-black-100 active:bg-black-200 flex justify-center items-center rounded"
              onClick={handlePlayOrPause}
            >
              {isPlaying ? <SvgIcon.Pause size={20} /> : <SvgIcon.Play size={20} />}
            </div>
            <div
              className="w-8 h-8 text-white cursor-pointer hover:bg-black-100 active:bg-black-200 flex justify-center items-center rounded"
              onClick={() => setActiveIndex(activeIndex + 1)}
            >
              <SvgIcon.SkipForward size={12} />
            </div>
          </div>
          <div>
            <p className="text-xs text-pink-300 font-din">{currentTimeStr}/{durationStr}</p>
          </div>
        </div>
      </div>
      <div className="w-0 h-0 overflow-hidden opacity-0">
        <audio ref={audioRef} onLoad={() => setLoading(false)} />
      </div>
    </>
  )
}
