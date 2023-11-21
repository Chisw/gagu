import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APP_ID_MAP, APP_LIST } from '..'
import { AppComponentProps } from '../../types'
import { useOpenOperation, usePlayInfo } from '../../hooks'
import ProgressSlider from './common/ProgressSlider'
import { line } from '../../utils'
import { SvgIcon } from '../../components/common'
import VolumeSlider from './common/VolumeSlider'
import { useRecoilState } from 'recoil'
import { entrySelectorState } from '../../states'
import { useTranslation } from 'react-i18next'

export default function VideoPlayer(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const { t } = useTranslation()

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    // setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.videoPlayer)

  const [, setEntrySelector] = useRecoilState(entrySelectorState)

  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [volumeSliderShow, setVolumeSliderShow] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEl = useMemo(() => {
    return videoRef.current as HTMLVideoElement | null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef.current])

  const playInfo = usePlayInfo({ el: videoEl, isPlaying, maxUnit: 'H' })

  useEffect(() => {
    setWindowLoading(loading)
  }, [setWindowLoading, loading])

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
      videoEl.play()
      setIsPlaying(true)
    }
  }, [videoEl, activeEntryStreamUrl])

  useEffect(() => {
    if (!videoEl) return
    videoEl.volume = volume
  }, [videoEl, volume])

  const handlePlayOrPause = useCallback(() => {
    if (!videoEl) return
    if (isPlaying) {
      videoEl.pause()
      setIsPlaying(false)
    } else {
      videoEl.play()
      setIsPlaying(true)
    }
  }, [videoEl, isPlaying])

  const handleProgressClick = useCallback((ratio: number) => {
    if (!videoEl) return
    videoEl.currentTime = videoEl.duration * ratio
  }, [videoEl])

  const buttonList = useMemo(() => {
    return [
      {
        title: isPlaying ? t`action.pause` : t`action.play`,
        icon: isPlaying ? <SvgIcon.Pause size={24} /> : <SvgIcon.Play size={20} />,
        onClick: handlePlayOrPause,
      },
    ]
  }, [isPlaying, handlePlayOrPause, t])


  const volumeIcon = useMemo(() => {
    let volumeIcon = <SvgIcon.VolumeDown size={14} />
    if (volume > .5) {
      volumeIcon = <SvgIcon.VolumeUp size={14} />
    } else if (volume === 0) {
      volumeIcon = <SvgIcon.VolumeMute size={14} />
    }
    return volumeIcon
  }, [volume])


  return (
    <>
      <div className="absolute inset-0 bg-black select-none group">
        <div
          className="absolute z-0 inset-0"
          onClick={handlePlayOrPause}
        >
          {!activeEntry && (
            <div
              className="m-2 p-2 border border-gray-500 cursor-pointer text-xs text-white rounded-sm text-center hover:border-gray-300"
              onClick={() => setEntrySelector({ show: true, app: APP_LIST.find(a => a.id === APP_ID_MAP.videoPlayer) })}
            >
              {t`action.openFile`}
            </div>
          )}
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
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            flex justify-between items-center
            backdrop-blur bg-black bg-opacity-50
            text-xs text-white
          `)}
        >
          <div className="absolute top-0 right-0 left-0 -mt-[2px]">
            <ProgressSlider
              duration={videoEl?.duration || 0}
              playPercent={playInfo.playPercent}
              frontAndBackColorClassNames={['bg-blue-700', 'bg-gray-400']}
              maxUnit="H"
              onProgressClick={handleProgressClick}
            />
          </div>
          <VolumeSlider
            show={volumeSliderShow}
            volume={volume}
            right={8}
            bottom={44}
            onClose={() => setVolumeSliderShow(false)}
            onVolumeChange={setVolume}
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
              {volumeIcon}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
