import { SvgIcon } from '../components/base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APP_ID_MAP } from '../utils/appList'
import { AppComponentProps } from '../types'
import { useFetch, useOpenOperation } from '../hooks'
import { FsApi } from '../api'
import { getPlayInfo, getReadableSize } from '../utils'
import SpectrumCanvas from '../components/SpectrumCanvas'
import EntrySelector from '../components/EntrySelector'
import VolumeSlider from '../components/VolumeSlider'
import ProgressSlider from '../components/ProgressSlider'

const nextPlayMode: any = {
  order: 'repeat',
  repeat: 'random',
  random: 'order',
}

const playModeIcon: any = {
  order: <SvgIcon.PlayOrder size={14} />,
  repeat: <SvgIcon.PlayRepeat size={14} />,
  random: <SvgIcon.PlayRandom size={14} />,
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

  const [playInfo, setPlayInfo] = useState({ currentTimeLabel: '00:00', durationLabel: '00:00', playPercent: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [playMode, setPlayMode] = useState('order')
  const [volume, setVolume] = useState(1)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)

  const { fetch: getTags, data, loading } = useFetch(FsApi.getTags)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioEl = useMemo(() => {
    return audioRef.current || null as HTMLAudioElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current])

  useEffect(() => {
    setWindowLoading(loading)
  }, [loading, setWindowLoading])

  useEffect(() => {
    if (audioEl && activeEntryStreamUrl) {
      audioEl.src = activeEntryStreamUrl
      audioEl.play()
      setIsPlaying(true)
    }
  }, [audioEl, activeEntryStreamUrl])

  useEffect(() => {
    if (!audioEl) return
    audioEl.volume = volume
  }, [audioEl, volume])

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
        if (!audioEl) return
        const { currentTime, duration } = audioEl
        setPlayInfo(getPlayInfo(currentTime || 0, duration || 0))
      }, 1000)
    } else {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [audioEl, isPlaying])

  useEffect(() => {
    if (activeEntry) {
      const title = `[${activeIndex + 1}/${matchedEntryList.length}] ${activeEntry.name}`
      setWindowTitle(title)
    }
  }, [activeIndex, activeEntry, matchedEntryList, setWindowTitle])

  const handlePlayOrPause = useCallback(() => {
    if (!audioEl) return
    if (isPlaying) {
      audioEl.pause()
      setIsPlaying(false)
    } else {
      audioEl.play()
      setIsPlaying(true)
    }
  }, [audioEl, isPlaying])

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

  const handleProgressClick = useCallback((ratio: number) => {
    if (!audioEl) return
    audioEl.currentTime = audioEl.duration * ratio
  }, [audioEl])

  const handleEnded = useCallback(() => {
    if (!audioEl) return
    if (playMode === 'repeat') {
      audioEl.currentTime = 0
      audioEl.play()
    } else {
      handlePrevOrNext(1)
    }
  }, [audioEl, playMode, handlePrevOrNext])

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
    let volumeIcon = <SvgIcon.VolumeDown size={14} />
    if (volume > .5) {
      volumeIcon = <SvgIcon.VolumeUp size={14} />
    } else if (volume === 0) {
      volumeIcon = <SvgIcon.VolumeMute size={14} />
    }
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
        icon: volumeIcon,
        onClick: () => setVolumeSliderShow(true),
      },
    ]
  }, [volume, playMode, isPlaying, handlePlayOrPause, handlePrevOrNext])

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900 select-none">
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

        <ProgressSlider
          duration={audioEl?.duration || 0}
          playPercent={playInfo.playPercent}
          frontAndBackColorClassNames={['bg-pink-600', 'bg-pink-300']}
          onProgressClick={handleProgressClick}
        />

        <VolumeSlider
          show={volumeSliderShow}
          volume={volume}
          right={8}
          bottom={50}
          onClose={() => setVolumeSliderShow(false)}
          onVolumeChange={setVolume}
        />

        {/* bottom */}
        <div className="relative z-0 w-full h-16 bg-black-100 flex-shrink-0">
          {/* SpectrumCanvas */}
          <div className="absolute z-0 inset-0">
            <SpectrumCanvas audioEl={audioEl} />
          </div>
          {/* bottom */}
          <div className="absolute inset-0 z-10 p-2 flex justify-between items-center">
            {/* info */}
            <div className="flex items-center pr-2 w-3/5">
              <div
                className="gg-app-icon w-12 h-12 rounded shadow-lg"
                data-app-id="music-player"
                style={base64 ? { backgroundImage: `url("${base64}")` } : undefined}
              />
              <div className="ml-2 text-xs text-pink-100 truncate">
                <p className="truncate">{title} - {artist}</p>
                <p className="opacity-50">{album}</p>
                <p className="opacity-50 font-din">{playInfo.currentTimeLabel} / {playInfo.durationLabel}</p>
              </div>
            </div>
            {/* buttons */}
            <div className="relative flex justify-end items-center w-2/5">
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
        <audio
          crossOrigin="anonymous"
          ref={audioRef}
          onEnded={handleEnded}
        />
      </div>
    </>
  )
}
