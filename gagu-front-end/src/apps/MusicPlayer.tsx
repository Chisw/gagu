import { SvgIcon } from '../components/base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../types'
import { useFetch, useOpenOperation } from '../hooks'
import { FsApi } from '../api'
import { DateTime } from 'luxon'
import { getReadableSize } from '../utils'
import SpectrumCanvas from '../components/SpectrumCanvas'
import EntrySelector from '../components/EntrySelector'

const getPlayerTime = (currentTime: number, duration: number) => {
  const currentSeconds = DateTime.fromSeconds(currentTime).toFormat('mm:ss')
  const durationSeconds = DateTime.fromSeconds(duration).toFormat('mm:ss')
  return [
    `${currentSeconds}`,
    `${durationSeconds}`,
    `${currentTime / duration * 100}`,
  ]
}

const nextPlayMode: any = {
  order: 'repeat',
  repeat: 'random',
  random: 'order',
}

const playModeIcon: any = {
  order: <SvgIcon.PlayRepeat size={14} />,
  repeat: <SvgIcon.PlayRepeatOne size={14} />,
  random: <SvgIcon.PlayShuffle size={14} />,
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
  const [timeList, setTimeList] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playMode, setPlayMode] = useState('order')

  const [currentTimeStr, durationStr, percent] = timeList

  const audioRef = useRef(null)
  const { fetch: getTags, data } = useFetch(FsApi.getTags)

  useEffect(() => {
    if (audioRef && audioRef.current && activeEntryStreamUrl) {
      const audio: any = audioRef.current
      audio.src = activeEntryStreamUrl
      audio.play()
      setIsPlaying(true)
    }
  }, [activeEntryStreamUrl])

  useEffect(() => {
    if (activeEntry) {
      const { name, parentPath } = activeEntry
      getTags(`${parentPath}/${name}`)
    }
  }, [activeEntry, getTags])

  useEffect(() => {
    let timer: any
    if (isPlaying) {
      timer = setInterval(() => {
        if (!audioRef || !audioRef.current) return
        const audio: HTMLAudioElement = audioRef.current
        const { currentTime, duration } = audio
        setTimeList(getPlayerTime(currentTime, duration))
      }, 1000)
    } else {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  useEffect(() => setWindowLoading(loading), [setWindowLoading, loading])

  useEffect(() => {
    if (activeEntry) {
      // setLoading(true)
      const title = `[${activeIndex + 1}/${matchedEntryList.length}] ${activeEntry.name}`
      setWindowTitle(title)
    }
  }, [activeIndex, activeEntry, matchedEntryList, setWindowTitle])

  const handlePlayOrPause = useCallback(() => {
    if (!audioRef || !audioRef.current) return
    const audio: HTMLAudioElement = audioRef.current
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handlePrevOrNext = useCallback((offset: number) => {
    const max = matchedEntryList.length - 1
    let targetIndex = 0
    if (playMode === 'random') {
      targetIndex = Math.round(Math.random() * max)
    } else {
      targetIndex = activeIndex + offset
      if (targetIndex > max) targetIndex = 0
      if (targetIndex < 0) targetIndex = max
    }
    setActiveIndex(targetIndex)
  }, [playMode, matchedEntryList, activeIndex, setActiveIndex])

  const handleProgressBarClick = useCallback((event: MouseEvent) => {
    if (!audioRef || !audioRef.current) return
    const audio: HTMLAudioElement = audioRef.current
    const { target, clientX } = event
    const { x, width } = (target as any).closest('.gg-app-window').getBoundingClientRect()
    const percent = (clientX - x) / width
    audio.currentTime = audio.duration * percent
  }, [])

  const { title, artist, album, base64 } = useMemo(() => {
    const { title, artist, album, base64 } = data || {
      title: activeEntry?.name || '无标题',
      artist: '未知作家',
      album: '未知专辑',
      base64: '',
    }
    return { title, artist, album, base64 }
  }, [data, activeEntry])

  const buttonList = useMemo(() => {
    return [
      {
        title: '播放模式',
        icon: playModeIcon[playMode],
        onClick: () => setPlayMode(nextPlayMode[playMode]),
      },
      {
        title: '上一首',
        icon: <SvgIcon.SkipBack size={14} />,
        onClick: () => handlePrevOrNext(-1),
      },
      {
        title: isPlaying ? '暂停' : '播放',
        icon: isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={20} />,
        onClick: handlePlayOrPause,
      },
      {
        title: '下一首',
        icon: <SvgIcon.SkipForward size={14} />,
        onClick: () => handlePrevOrNext(1),
      },
      {
        title: '调整音量',
        icon: <SvgIcon.VolumeDown size={14} />,
        onClick: () => {},
      },
    ]
  }, [playMode, isPlaying, handlePlayOrPause, handlePrevOrNext])

  return (
    <>
      <div className="gg-app absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900 select-none">
        {!activeEntry && (
          <EntrySelector
            trigger={(
              <div className="m-2 p-2 border border-pink-500 cursor-pointer text-xs text-white rounded-sm text-center hover:border-pink-300">
                打开文件或目录
              </div>
            )}
          />
        )}
        {/* list */}
        <div className="relative flex-grow pb-3 overflow-y-auto">
          {matchedEntryList.map((entry, entryIndex) => {
            const { name, size } = entry
            const isActive = entryIndex === activeIndex
            const indexLen = Math.max(String(matchedEntryList.length).length, 2)
            const indexStr = String(entryIndex + 1).padStart(indexLen, '0')
            const onClick = isActive ? handlePlayOrPause : () => setActiveIndex(entryIndex)
            return (
              <div
                key={name}
                className="px-2 py-1 text-xs text-white even:bg-black-50 hover:bg-black-100 flex items-center group"
                onDoubleClick={onClick}
              >
                <div className="mr-2 font-din text-3xl opacity-60 italic">{indexStr}.</div>
                <div className="flex-grow">
                  <div>{name}</div>
                  <div>
                    <span className="opacity-50">{getReadableSize(size!)}</span>
                  </div>
                </div>
                <div
                  className={`px-2 cursor-pointer opacity-80 hover:opacity-100 active:opacity-70 ${isActive ? '' : 'hidden group-hover:block'}`}
                  onClick={onClick}
                >
                  {activeIndex === entryIndex && isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={24} />}
                </div>
              </div>
            )
          })}
        </div>
        {/* bottom */}
        <div className="relative w-full h-16 bg-black-100 flex-shrink-0">
          {/* SpectrumCanvas */}
          {activeEntryStreamUrl.startsWith(window.location.origin) && (
            <div className="absolute z-0 inset-0">
              <SpectrumCanvas audioRef={audioRef} />
            </div>
          )}
          {/* progress bar */}
          <div
            className="absolute z-0 top-0 right-0 left-0 w-full -mt-2 h-4 cursor-pointer group"
            onClick={e => handleProgressBarClick(e as any as MouseEvent)}
          >
            <div className="absolute bottom-0 right-0 left-0 transform -translate-y-2 h-2px bg-pink-300 group-hover:opacity-70">
              <div
                className="h-full bg-pink-600"
                style={{ width: `${percent}%` }}
              >
                <div
                  className="absolute -mt-3px -ml-1 w-2 h-2 rounded bg-white shadow"
                  style={{ left: `${percent}%` }}
                />
              </div>
            </div>
          </div>
          {/* content */}
          <div className="absolute inset-0 z-10 p-2 flex justify-between items-center">
            <div className="flex items-center pr-2 w-3/5">
              <img
                className="w-12 h-12 rounded shadow-lg"
                alt=""
                src={base64}
              />
              <div className="ml-2 text-xs text-pink-100 truncate">
                <p className="truncate">{title} - {artist}</p>
                <p className="opacity-50">{album}</p>
                <p className="opacity-50 font-din">{currentTimeStr} / {durationStr}</p>
              </div>
            </div>
            <div className="flex justify-end items-center w-2/5">
              {buttonList.map(({ title, icon, onClick }) => (
                <div
                  key={title}
                  title={title}
                  className="w-8 h-8 text-white cursor-pointer hover:bg-black-100 active:bg-black-200 flex justify-center items-center rounded"
                  onClick={onClick}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-0 h-0 overflow-hidden opacity-0">
        <audio ref={audioRef} onLoad={() => setLoading(false)} />
      </div>
    </>
  )
}
