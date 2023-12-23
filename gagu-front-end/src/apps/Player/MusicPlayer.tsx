import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppComponentProps, AppId } from '../../types'
import { useRequest, useRunAppEvent, usePlayInfo, useUserConfig, useHotKey } from '../../hooks'
import { FsApi } from '../../api'
import { getEntryPath, getIndexLabel, getReadableSize, line } from '../../utils'
import SpectrumCanvas from './common/SpectrumCanvas'
import VolumeSlider from './common/VolumeSlider'
import ProgressSlider from './common/ProgressSlider'
import { IconButton, Opener, SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'

const appId = AppId.musicPlayer

type PlayMode = 'ORDER' | 'SINGLE' | 'RANDOM'

const playModeIcon: any = {
  ORDER: <SvgIcon.PlayOrder size={14} />,
  SINGLE: <SvgIcon.PlayRepeat size={14} />,
  RANDOM: <SvgIcon.PlayRandom size={14} />,
}

export default function MusicPlayer(props: AppComponentProps) {

  const {
    isTopWindow,
    setWindowTitle,
  } = props

  const { t } = useTranslation()

  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useRunAppEvent(appId)

  const { userConfig: { kiloSize } } = useUserConfig()

  const [isPlaying, setIsPlaying] = useState(false)
  const [playMode, setPlayMode] = useState<PlayMode>('ORDER')
  const [volume, setVolume] = useState(1)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)

  const { request: queryAudioTags, data } = useRequest(FsApi.queryAudioTags)

  const { title, artist, album, coverBase64 } = useMemo(() => {
    const {
      title = activeEntry?.name || t`text.noTitle`,
      artist = t`text.unknownArtist`,
      album = t`text.unknownAlbum`,
      coverBase64 = '',
    } = data?.data || {}
    return { title, artist, album, coverBase64 }
  }, [data, activeEntry, t])

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioEl = useMemo(() => {
    return audioRef.current || null as HTMLAudioElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current])

  const playInfo = usePlayInfo({ el: audioEl, isPlaying })

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

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
      queryAudioTags(getEntryPath(activeEntry))
    }
  }, [activeEntry, queryAudioTags])

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
    if (playMode === 'RANDOM') {
      targetIndex = Math.round(Math.random() * max)
    } else {
      targetIndex = activeIndex + offset
      if (targetIndex > max) targetIndex = 0
      if (targetIndex < 0) targetIndex = max
    }
    setActiveIndex(targetIndex)
  }, [playMode, matchedEntryList, activeIndex, setActiveIndex])

  const handleProgressChange = useCallback((ratio: number, offsetSeconds?: number) => {
    if (!audioEl) return
    if (offsetSeconds) {
      audioEl.currentTime += offsetSeconds
    } else {
      audioEl.currentTime = audioEl.duration * ratio
    }
    if (!isPlaying) handlePlayOrPause()
  }, [audioEl, isPlaying, handlePlayOrPause])

  const handlePlayModeChange = useCallback((mode?: PlayMode) => {
    const targetMode = mode || {
      ORDER: 'SINGLE',
      SINGLE: 'RANDOM',
      RANDOM: 'ORDER',
    }[playMode] as PlayMode

    setPlayMode(targetMode)
  }, [playMode])

  const handleVolumeChange = useCallback((offset: number) => {
    const volumeValue = volume * 100
    if ((offset < 0 && volumeValue <= 0) || (offset > 0 && volumeValue >= 100)) return
    const targetVolume = Math.max(Math.min((volumeValue + offset) / 100, 1), 0)
    setVolume(targetVolume)
  }, [volume])

  const handleEnded = useCallback(() => {
    if (!audioEl) return
    if (playMode === 'SINGLE') {
      audioEl.currentTime = 0
      audioEl.play()
    } else {
      handlePrevOrNext(1)
    }
  }, [audioEl, playMode, handlePrevOrNext])

  const buttonList = useMemo(() => {
    let volumeIcon = <SvgIcon.VolumeDown size={14} />
    if (volume > .5) {
      volumeIcon = <SvgIcon.VolumeUp size={14} />
    } else if (volume === 0) {
      volumeIcon = <SvgIcon.VolumeMute size={14} />
    }
    return [
      {
        title: t`action.playMode`,
        icon: playModeIcon[playMode],
        onClick: handlePlayModeChange,
      },
      {
        title: t`action.previousSong`,
        icon: <SvgIcon.SkipBack size={14} />,
        onClick: () => handlePrevOrNext(-1),
      },
      {
        title: isPlaying ? t`action.pause` : t`action.play`,
        icon: isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={20} />,
        onClick: handlePlayOrPause,
      },
      {
        title: t`action.nextSong`,
        icon: <SvgIcon.SkipForward size={14} />,
        onClick: () => handlePrevOrNext(1),
      },
      {
        title: t`action.volume`,
        icon: volumeIcon,
        onClick: () => setVolumeSliderShow(true),
      },
    ]
  }, [volume, t, playMode, handlePlayModeChange, isPlaying, handlePlayOrPause, handlePrevOrNext])

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'Space, Space': handlePlayOrPause,
      'Meta+ArrowLeft, Ctrl+ArrowLeft': () => handlePrevOrNext(-1),
      'Meta+ArrowRight, Ctrl+ArrowRight': () => handlePrevOrNext(1),
      'ArrowUp, ArrowUp': () => handleVolumeChange(1),
      'ArrowDown, ArrowDown': () => handleVolumeChange(-1),
      'Shift+ArrowUp, Shift+ArrowUp': () => handleVolumeChange(5),
      'Shift+ArrowDown, Shift+ArrowDown': () => handleVolumeChange(-5),
      'ArrowRight, ArrowRight': () => handleProgressChange(0, 1),
      'ArrowLeft, ArrowLeft': () => handleProgressChange(0, -1),
      'Shift+ArrowRight, Shift+ArrowRight': () => handleProgressChange(0, 5),
      'Shift+ArrowLeft, Shift+ArrowLeft': () => handleProgressChange(0, -5),
      'KeyO, KeyO': () => handlePlayModeChange('ORDER'),
      'KeyR, KeyR': () => handlePlayModeChange('RANDOM'),
      'KeyS, KeyS': () => handlePlayModeChange('SINGLE'),
    },
  })

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900 select-none">
        {!activeEntry && <Opener appId={appId} />}
        {/* list */}
        <div className="relative z-0 flex-grow pb-3 overflow-y-auto">
          {matchedEntryList.map((entry, entryIndex) => {
            const { name, size } = entry
            const isActive = entryIndex === activeIndex
            const indexNo = getIndexLabel(entryIndex, matchedEntryList.length, { minWidth: 2, hideTotal: true })
            const onClick = isActive ? handlePlayOrPause : () => setActiveIndex(entryIndex)
            return (
              <div
                key={name}
                className="relative p-2 text-xs text-white even:bg-black even:bg-opacity-5 hover:bg-black hover:bg-opacity-10 flex items-center group"
                onDoubleClick={onClick}
              >
                <div
                  className="gagu-app-icon flex-shrink-0 mr-2 w-10 h-10 rounded-sm shadow-lg overflow-hidden"
                  data-app-id="music-player"
                >
                  <div
                    className="w-full h-full bg-cover bg-center"                    
                    style={{ backgroundImage: `url("${FsApi.getThumbnailStreamUrl(entry)}")` }}
                  />
                </div>
                <div className="flex-grow">
                  <div>
                    <span className="font-din opacity-60">{indexNo}. </span>{name}
                  </div>
                  <div>
                    <span className="opacity-50 font-din">{getReadableSize(size!, kiloSize)}</span>
                  </div>
                </div>
                <div
                  className={line(`
                    absolute top-0 right-0 bottom-0
                    px-4 cursor-pointer opacity-80
                    hover:opacity-100 hover:bg-white hover:bg-opacity-10 active:opacity-70
                    backdrop-blur
                    flex justify-center items-center
                    ${isActive ? '' : 'hidden group-hover:flex'}
                  `)}
                  onClick={onClick}
                >
                  {activeIndex === entryIndex && isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={24} />}
                </div>
              </div>
            )
          })}
        </div>

        <VolumeSlider
          show={volumeSliderShow}
          volume={volume}
          right={8}
          bottom={50}
          onClose={() => setVolumeSliderShow(false)}
          onVolumeChange={setVolume}
        />

        {activeEntry && (
          <ProgressSlider
            duration={audioEl?.duration || 0}
            playPercent={playInfo.playPercent}
            frontAndBackColorClassNames={['bg-pink-600', 'bg-pink-300']}
            onProgressClick={handleProgressChange}
          />
        )}

        {/* bottom */}
        <div className={`relative z-0 w-full h-16 bg-black bg-opacity-10 flex-shrink-0 ${activeEntry ? '' : 'hidden'}`}>
          {/* SpectrumCanvas */}
          <div className="absolute z-0 inset-0">
            <SpectrumCanvas audioEl={audioEl} />
          </div>
          {/* bottom */}
          <div className="absolute inset-0 z-10 p-2 flex justify-between items-center">
            {/* info */}
            <div className="flex items-center pr-2 w-3/5">
              <div
                className="gagu-app-icon w-12 h-12 rounded shadow-lg"
                data-app-id="music-player"
                style={coverBase64 ? { backgroundImage: `url("${coverBase64}")` } : undefined}
              />
              <div className="ml-2 text-xs text-pink-100 truncate">
                <p className="truncate" title={`${title} - ${artist}`}>{title} - {artist}</p>
                <p className="opacity-50">{album}</p>
                <p className="opacity-50 font-din">
                  {playInfo.currentTimeLabel} / {playInfo.durationLabel}
                </p>
              </div>
            </div>
            {/* buttons */}
            <div className="relative flex justify-end items-center w-2/5">
              {buttonList.map(({ title, icon, onClick }) => (
                <IconButton
                  key={title}
                  icon={icon}
                  title={title}
                  onClick={onClick}
                />
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
