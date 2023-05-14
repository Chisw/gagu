import { SvgIcon } from '../../components/base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APP_ID_MAP, APP_LIST } from '..'
import { AppComponentProps } from '../../types'
import { useRequest, useOpenOperation, usePlayInfo } from '../../hooks'
import { FsApi } from '../../api'
import { getPaddedNo, getReadableSize } from '../../utils'
import SpectrumCanvas from './common/SpectrumCanvas'
import VolumeSlider from './common/VolumeSlider'
import ProgressSlider from './common/ProgressSlider'
import { IconButton } from '../../components/base'
import { useRecoilState } from 'recoil'
import { entrySelectorState } from '../../states'
import { useTranslation } from 'react-i18next'

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

  const { t } = useTranslation()

  const {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.musicPlayer)

  const [, setEntrySelector] = useRecoilState(entrySelectorState)

  const [isPlaying, setIsPlaying] = useState(false)
  const [playMode, setPlayMode] = useState('order')
  const [volume, setVolume] = useState(1)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)

  const { request: getTags, data, loading } = useRequest(FsApi.getTags)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioEl = useMemo(() => {
    return audioRef.current || null as HTMLAudioElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current])

  const playInfo = usePlayInfo({ el: audioEl, isPlaying })

  useEffect(() => {
    setWindowLoading(loading)
  }, [loading, setWindowLoading])

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
      const { name, parentPath } = activeEntry
      getTags(`${parentPath}/${name}`)
    }
  }, [activeEntry, getTags])

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
      title: activeEntry?.name || t`text.noTitle`,
      artist: t`text.unknownArtist`,
      album: t`text.unknownAlbum`,
      base64: '',
    }
    return { title, artist, album, base64 }
  }, [data, activeEntry, t])

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
        onClick: () => setPlayMode(nextPlayMode[playMode]),
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
  }, [volume, playMode, isPlaying, handlePlayOrPause, handlePrevOrNext, t])

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900 select-none">
        {!activeEntry && (
          <div
            className="m-2 p-2 border border-pink-500 cursor-pointer text-xs text-white rounded-sm text-center hover:border-pink-300"
            onClick={() => setEntrySelector({ show: true, app: APP_LIST.find(a => a.id === APP_ID_MAP.musicPlayer) })}
          >
            {t`action.openFile`}
          </div>
        )}
        {/* list */}
        <div className="relative flex-grow pb-3 overflow-y-auto">
          {matchedEntryList.map((entry, entryIndex) => {
            const { name, size } = entry
            const isActive = entryIndex === activeIndex
            const indexNo = getPaddedNo(entryIndex, matchedEntryList.length, { minWidth: 2, hideTotal: true })
            const onClick = isActive ? handlePlayOrPause : () => setActiveIndex(entryIndex)
            return (
              <div
                key={name}
                className="px-2 py-1 text-xs text-white even:bg-black-50 hover:bg-black-100 flex items-center group"
                onDoubleClick={onClick}
              >
                <div className="mr-2 font-din text-3xl opacity-60 italic">{indexNo}.</div>
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
                className="gagu-app-icon w-12 h-12 rounded shadow-lg"
                data-app-id="music-player"
                style={base64 ? { backgroundImage: `url("${base64}")` } : undefined}
              />
              <div className="ml-2 text-xs text-pink-100 truncate">
                <p className="truncate" title={`${title} - ${artist}`}>{title} - {artist}</p>
                <p className="opacity-50">{album}</p>
                <p className="opacity-50 font-din">
                  {getPaddedNo(activeIndex, matchedEntryList.length, { minWidth: 2 })}
                  &nbsp;-&nbsp;
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
