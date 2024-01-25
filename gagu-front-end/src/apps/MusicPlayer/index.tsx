import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppComponentProps, AppId, IEntry, PlayMode, PlayModeType, TunnelType } from '../../types'
import { useRequest, useRunAppEvent, usePlayInfo, useUserConfig, useHotKey } from '../../hooks'
import { FsApi, TunnelApi } from '../../api'
import { defaultMusicCoverSvg, getEntryPath, getIndexLabel, getReadableSize, line } from '../../utils'
import SpectrumCanvas from './SpectrumCanvas'
import { IconButton, Opener, SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { ProgressSlider, VolumeIcon, VolumeIndicator, VolumeSlider } from '../../components/player'
import ImmersiveTheatre from './ImmersiveTheatre'

const appId = AppId.musicPlayer

const playModeIconMap: any = {
  [PlayMode.order]: <SvgIcon.PlayOrder size={14} />,
  [PlayMode.single]: <SvgIcon.PlayRepeat size={14} />,
  [PlayMode.random]: <SvgIcon.PlayRandom size={14} />,
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

  const {
    userConfig,
    userConfig: {
      kiloSize,
      musicPlayerVolume,
      musicPlayerPlayMode,
    },
    setUserConfig,
} = useUserConfig()

  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)
  const [volumeChangedTime, setVolumeChangedTime] = useState(0)
  const [theatreShow, setTheatreShow] = useState(false)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  const { request: queryAudioInfo, response } = useRequest(FsApi.queryAudioInfo)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioNode = useMemo(() => {
    return audioRef.current || null as HTMLAudioElement | null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current])

  const indexLabel = useMemo(() => {
    return getIndexLabel(activeIndex, matchedEntryList.length, { minWidth: 2 })
  }, [activeIndex, matchedEntryList.length])

  const { title, artist, album, coverStyle } = useMemo(() => {
    const {
      title = activeEntry?.name || t`text.noTitle`,
      artist = t`text.unknownArtist`,
      album = t`text.unknownAlbum`,
      coverBase64 = defaultMusicCoverSvg,
    } = response?.data || {}

    const coverStyle = coverBase64 ? { backgroundImage: `url("${coverBase64}")` } : undefined
    return { title, artist, album, coverStyle }
  }, [response, activeEntry, t])

  const playInfo = usePlayInfo({ el: audioNode, isPlaying })

  const handlePlayOrPause = useCallback(() => {
    if (!audioNode) return
    if (isPlaying) {
      audioNode.pause()
      setIsPlaying(false)
    } else {
      audioNode.play()
      setIsPlaying(true)
    }
  }, [audioNode, isPlaying])

  const handlePrevOrNext = useCallback((offset: number) => {
    const max = matchedEntryList.length - 1
    let targetIndex = 0
    if (musicPlayerPlayMode === PlayMode.random) {
      targetIndex = Math.round(Math.random() * max)
    } else {
      targetIndex = activeIndex + offset
      if (targetIndex > max) targetIndex = 0
      if (targetIndex < 0) targetIndex = max
    }
    setActiveIndex(targetIndex)
  }, [musicPlayerPlayMode, matchedEntryList, activeIndex, setActiveIndex])

  const handleProgressChange = useCallback((ratio: number, offsetSeconds?: number) => {
    if (!audioNode) return
    if (offsetSeconds) {
      audioNode.currentTime += offsetSeconds
    } else {
      audioNode.currentTime = audioNode.duration * ratio
    }
    if (!isPlaying) handlePlayOrPause()
  }, [audioNode, isPlaying, handlePlayOrPause])

  const handlePlayModeChange = useCallback((mode?: PlayModeType) => {
    const targetMode = mode || {
      [PlayMode.order]: PlayMode.single,
      [PlayMode.single]: PlayMode.random,
      [PlayMode.random]: PlayMode.order,
    }[musicPlayerPlayMode] as PlayModeType

    setUserConfig({ ...userConfig, musicPlayerPlayMode: targetMode })
  }, [musicPlayerPlayMode, setUserConfig, userConfig])

  const handleVolumeChange = useCallback((vol: number, offset?: number) => {
    let targetVolume: number
    if (offset) {
      targetVolume = userConfig.musicPlayerVolume + offset
    } else {
      targetVolume = vol
    }
    const musicPlayerVolume = +Math.max(Math.min(targetVolume, 1), 0).toFixed(2)
    setUserConfig({ ...userConfig, musicPlayerVolume })
    setVolumeChangedTime(Date.now())
  }, [setUserConfig, userConfig])

  const handleEnded = useCallback(() => {
    if (!audioNode) return
    if (musicPlayerPlayMode === PlayMode.single) {
      audioNode.currentTime = 0
      audioNode.play()
    } else {
      handlePrevOrNext(1)
    }
  }, [audioNode, musicPlayerPlayMode, handlePrevOrNext])

  const handleDownload = useCallback(async (entry: IEntry) => {
    const { name: downloadName } = entry
    const { success, data: code } = await createTunnel({
      type: TunnelType.download,
      entryList: [entry],
      downloadName,
    })
    if (success) {
      TunnelApi.download(code)
    }
  }, [createTunnel])

  useEffect(() => {
    if (activeEntry) {
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  useEffect(() => {
    if (!audioNode) return
    const audioContext = new AudioContext()
    const analyserNode = audioContext.createAnalyser()
    const audioSourceNode = audioContext.createMediaElementSource(audioNode)

    audioSourceNode.connect(analyserNode)
    analyserNode.connect(audioContext.destination)
    setAnalyserNode(analyserNode)
  }, [audioNode])

  useEffect(() => {
    if (!audioNode) return
    if (activeEntryStreamUrl) {
      audioNode.src = activeEntryStreamUrl
      audioNode.play()
      setIsPlaying(true)
    }
  }, [activeEntryStreamUrl, audioNode])

  useEffect(() => {
    if (!audioNode) return
    audioNode.volume = musicPlayerVolume
  }, [audioNode, musicPlayerVolume])

  useEffect(() => {
    if (activeEntry) {
      queryAudioInfo(getEntryPath(activeEntry))
    }
  }, [activeEntry, queryAudioInfo])

  useEffect(() => {
    if (!audioNode) return
    audioNode.addEventListener('ended', handleEnded)
    return () => {
      audioNode.removeEventListener('ended', handleEnded)
    }
  }, [audioNode, handleEnded])

  useEffect(() => {
    if (!audioNode) return
    return () => {
      audioNode.pause()
    }
  }, [audioNode])

  const buttonList = useMemo(() => {
    return [
      {
        title: t`action.playMode`,
        icon: playModeIconMap[musicPlayerPlayMode],
        onClick: () => handlePlayModeChange(),
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
        icon: <VolumeIcon volume={musicPlayerVolume} size={14} />,
        onClick: () => setVolumeSliderShow(true),
      },
    ]
  }, [musicPlayerVolume, t, musicPlayerPlayMode, handlePlayModeChange, isPlaying, handlePlayOrPause, handlePrevOrNext])

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'Space, Space': handlePlayOrPause,
      'Meta+ArrowLeft, Ctrl+ArrowLeft': () => handlePrevOrNext(-1),
      'Meta+ArrowRight, Ctrl+ArrowRight': () => handlePrevOrNext(1),
      'ArrowUp, ArrowUp': () => handleVolumeChange(0, 0.01),
      'ArrowDown, ArrowDown': () => handleVolumeChange(0, -0.01),
      'Shift+ArrowUp, Shift+ArrowUp': () => handleVolumeChange(0, 0.05),
      'Shift+ArrowDown, Shift+ArrowDown': () => handleVolumeChange(0, -0.05),
      'ArrowRight, ArrowRight': () => handleProgressChange(0, 1),
      'ArrowLeft, ArrowLeft': () => handleProgressChange(0, -1),
      'Shift+ArrowRight, Shift+ArrowRight': () => handleProgressChange(0, 5),
      'Shift+ArrowLeft, Shift+ArrowLeft': () => handleProgressChange(0, -5),
      'KeyO, KeyO': () => handlePlayModeChange(PlayMode.order),
      'KeyR, KeyR': () => handlePlayModeChange(PlayMode.random),
      'KeyS, KeyS': () => handlePlayModeChange(PlayMode.single),
      'Enter, Enter': () => setTheatreShow(true),
    },
  })

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-pink-700 to-pink-900 select-none">
        <Opener show={!activeEntry} appId={appId} />

        <VolumeIndicator volume={musicPlayerVolume} time={volumeChangedTime} />

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
                  className="flex-shrink-0 mr-2 w-10 h-10 shadow-lg overflow-hidden bg-center bg-cover bg-no-repeat"
                  style={{ backgroundImage: `url("${defaultMusicCoverSvg}")` }}
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
                    <span
                      className="inline-flex items-center text-white text-opacity-50 hover:text-opacity-80 active:text-opacity-60 cursor-pointer"
                      onClick={() => handleDownload(entry)}
                    >
                      <span className="mr-1">
                        <SvgIcon.Download size={12} />
                      </span>
                      <span className="font-din">{getReadableSize(size!, kiloSize)}</span>
                    </span>
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
                  {activeIndex === entryIndex && isPlaying
                    ? <SvgIcon.Pause size={24} />
                    : <SvgIcon.Play size={24} />
                  }
                </div>
              </div>
            )
          })}
        </div>

        {!theatreShow && (
          <VolumeSlider
            show={volumeSliderShow}
            volume={musicPlayerVolume}
            right={8}
            bottom={50}
            onClose={() => setVolumeSliderShow(false)}
            onVolumeChange={handleVolumeChange}
          />
        )}

        {activeEntry && (
          <ProgressSlider
            duration={audioNode?.duration || 0}
            playPercent={playInfo.playPercent}
            frontAndBackColorClassNames={['bg-pink-600', 'bg-pink-300']}
            onProgressClick={handleProgressChange}
          />
        )}

        {/* bottom */}
        <div className={`relative z-0 w-full h-16 bg-black bg-opacity-10 flex-shrink-0 ${activeEntry ? '' : 'hidden'}`}>
          {/* SpectrumCanvas */}
          <div className="absolute z-0 inset-0">
            {!theatreShow && <SpectrumCanvas analyserNode={analyserNode} />}
          </div>
          {/* bottom */}
          <div className="absolute inset-0 z-10 p-2 flex justify-between items-center">
            {/* info */}
            <div className="flex items-center pr-2 w-3/5">
              <div
                className="w-12 h-12 shadow-lg cursor-pointer transition-transform duration-100 hover:scale-105 bg-center bg-cover bg-no-repeat"
                style={coverStyle}
                onClick={() => setTheatreShow(true)}
              />
              <div className="ml-2 text-xs text-pink-100 truncate">
                <p className="truncate" title={`${title} - ${artist}`}>{title}</p>
                <p className="opacity-50">{album} - {artist}</p>
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

      <ImmersiveTheatre
        show={theatreShow}
        onClose={() => setTheatreShow(false)}
        {...{
          title,
          artist,
          album,
          coverStyle,
          buttonList,
          playInfo,
          indexLabel,
          isPlaying,
          volume: musicPlayerVolume,
          volumeChangedTime,
          volumeSliderShow,
          analyserNode,
        }}
        duration={audioNode?.duration || 0}
        onProgressChange={handleProgressChange}
        onCloseVolumeSlider={() => setVolumeSliderShow(false)}
        onVolumeChange={handleVolumeChange}
      />
    </>
  )
}
