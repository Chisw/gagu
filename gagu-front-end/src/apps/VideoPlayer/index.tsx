import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppComponentProps, AppId } from '../../types'
import { useRunAppEvent, usePlayInfo, useHotKey, useUserConfig } from '../../hooks'
import { line } from '../../utils'
import { Opener, SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { ProgressSlider, VolumeIcon, VolumeIndicator, VolumeSlider } from '../../components/player'

const appId = AppId.videoPlayer

export default function VideoPlayer(props: AppComponentProps) {

  const {
    isTopWindow,
    setWindowTitle,
  } = props

  const { t } = useTranslation()

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    // setActiveIndex,
  } = useRunAppEvent(appId)

  const {
    userConfig,
    userConfig: {
      // kiloSize,
      videoPlayerVolume,
    },
    setUserConfig,
} = useUserConfig()

  const [, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)
  const [volumeChangedTime, setVolumeChangedTime] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEl = useMemo(() => {
    return videoRef.current as HTMLVideoElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef.current])

  const playInfo = usePlayInfo({ el: videoEl, isPlaying, maxUnit: 'H' })

  useEffect(() => {
    if (activeEntry) {
      setLoading(false)
      setWindowTitle(activeEntry.name)
    }
  }, [activeEntry, setWindowTitle])

  useEffect(() => {
    if (videoEl && activeEntryStreamUrl) {
      videoEl.src = activeEntryStreamUrl
      videoEl.load()
      videoEl?.play()
      setIsPlaying(true)
    }
  }, [videoEl, activeEntryStreamUrl])

  useEffect(() => {
    if (!videoEl) return
    videoEl.volume = videoPlayerVolume
  }, [videoEl, videoPlayerVolume])

  const handlePlayOrPause = useCallback(() => {
    if (!videoEl) return
    if (isPlaying) {
      videoEl.pause()
      setIsPlaying(false)
    } else {
      videoEl?.play()
      setIsPlaying(true)
    }
  }, [videoEl, isPlaying])

  const handleProgressChange = useCallback((ratio: number, offsetSeconds?: number) => {
    if (!videoEl) return
    if (offsetSeconds) {
      videoEl.currentTime += offsetSeconds
    } else {
      videoEl.currentTime = videoEl.duration * ratio
    }
    if (!isPlaying) handlePlayOrPause()
  }, [videoEl, isPlaying, handlePlayOrPause])

  const handleVolumeChange = useCallback((vol: number, offset?: number) => {
    let targetVolume: number
    if (offset) {
      targetVolume = userConfig.videoPlayerVolume + offset
    } else {
      targetVolume = vol
    }
    const videoPlayerVolume = +Math.max(Math.min(targetVolume, 1), 0).toFixed(2)
    setUserConfig({ ...userConfig, videoPlayerVolume })
    setVolumeChangedTime(Date.now())
  }, [setUserConfig, userConfig])

  const buttonList = useMemo(() => {
    return [
      {
        title: isPlaying ? t`action.pause` : t`action.play`,
        icon: isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={20} />,
        onClick: handlePlayOrPause,
      },
    ]
  }, [isPlaying, handlePlayOrPause, t])

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'Space, Space': handlePlayOrPause,
      // 'Meta+ArrowLeft, Ctrl+ArrowLeft': () => handlePrevOrNext(-1),
      // 'Meta+ArrowRight, Ctrl+ArrowRight': () => handlePrevOrNext(1),
      'ArrowUp, ArrowUp': () => handleVolumeChange(0, 0.01),
      'ArrowDown, ArrowDown': () => handleVolumeChange(0, -0.01),
      'Shift+ArrowUp, Shift+ArrowUp': () => handleVolumeChange(0, 0.05),
      'Shift+ArrowDown, Shift+ArrowDown': () => handleVolumeChange(0, -0.05),
      'ArrowRight, ArrowRight': () => handleProgressChange(0, 1),
      'ArrowLeft, ArrowLeft': () => handleProgressChange(0, -1),
      'Shift+ArrowRight, Shift+ArrowRight': () => handleProgressChange(0, 5),
      'Shift+ArrowLeft, Shift+ArrowLeft': () => handleProgressChange(0, -5),
      // 'KeyO, KeyO': () => handlePlayModeChange('ORDER'),
      // 'KeyR, KeyR': () => handlePlayModeChange('RANDOM'),
      // 'KeyS, KeyS': () => handlePlayModeChange('SINGLE'),
    },
  })

  return (
    <>
      <div className="absolute inset-0 bg-black select-none group">
        <Opener show={!activeEntry} appId={appId} />

        <VolumeIndicator volume={videoPlayerVolume} time={volumeChangedTime} />

        <div
          className="absolute z-0 inset-0"
          onClick={handlePlayOrPause}
        >
          <video
            autoPlay
            ref={videoRef}
            className="w-full h-full object-contain object-center"
            onEnded={() => setTimeout(() => setIsPlaying(false), 1000)}
          />
        </div>

        <div
          className={line(`
            absolute z-10 right-0 bottom-0 left-0
            p-2 h-12
            md:opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            flex justify-between items-center
            backdrop-blur bg-black bg-opacity-50
            text-xs text-white
            ${activeEntry ? '' : 'hidden'}
          `)}
        >
          <div className="absolute top-0 right-0 left-0 -mt-[2px]">
            <ProgressSlider
              duration={videoEl?.duration || 0}
              playPercent={playInfo.playPercent}
              frontAndBackColorClassNames={['bg-blue-700', 'bg-gray-400']}
              maxUnit="H"
              onProgressClick={handleProgressChange}
            />
          </div>
          <VolumeSlider
            show={volumeSliderShow}
            volume={videoPlayerVolume}
            right={44}
            bottom={44}
            onClose={() => setVolumeSliderShow(false)}
            onVolumeChange={handleVolumeChange}
          />
          <div className="w-24">
            <p className="opacity-50 font-din">{playInfo.currentTimeLabel} / {playInfo.durationLabel}</p>
          </div>
          <div className="relative flex justify-center items-center">
            {buttonList.map(({ title, icon, onClick }) => (
              <div
                key={title}
                title={title}
                className="w-8 h-8 text-white cursor-pointer hover:bg-white hover:bg-opacity-20 active:bg-opacity-10 flex justify-center items-center rounded"
                onClick={onClick}
              >
                {icon}
              </div>
            ))}
          </div>
          <div className="w-24 flex justify-end">
            <div
              title={t`action.volume`}
              className="w-8 h-8 text-white cursor-pointer hover:bg-white hover:bg-opacity-20 active:bg-opacity-10 flex justify-center items-center rounded"
              onClick={() => setVolumeSliderShow(true)}
            >
              <VolumeIcon volume={videoPlayerVolume} size={14} />
            </div>
            <div
              className="ml-1 w-8 h-8 text-white cursor-pointer hover:bg-white hover:bg-opacity-20 active:bg-opacity-10 flex justify-center items-center rounded"
              onClick={() => videoEl?.requestFullscreen()}
            >
              <SvgIcon.Fullscreen />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
