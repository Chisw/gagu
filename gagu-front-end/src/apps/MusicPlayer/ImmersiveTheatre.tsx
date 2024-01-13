import { Modal } from '@douyinfe/semi-ui'
import { CSSProperties, ReactNode } from 'react'
import { IconButton, SvgIcon } from '../../components/common'
import { IPlayInfo, useUserConfig } from '../../hooks'
import SpectrumCanvas from './SpectrumCanvas'
import { line } from '../../utils'
import { ProgressSlider, VolumeIndicator, VolumeSlider } from '../../components/player'

interface ImmersiveTheatreProps {
  show: boolean
  onClose: () => void
  title: string
  artist: string
  album: string
  coverStyle?: CSSProperties
  buttonList: {
    title: string
    icon: ReactNode
    onClick: () => void
  }[]
  duration: number
  playInfo: IPlayInfo
  indexLabel: string
  isPlaying: boolean
  volume: number
  volumeChangedTime: number
  volumeSliderShow: boolean,
  analyserNode: AnalyserNode | null
  onProgressChange: (radio: number) => void
  onCloseVolumeSlider: () => void
  onVolumeChange: (volume: number) => void
}

export default function ImmersiveTheatre(props: ImmersiveTheatreProps) {
  const {
    show,
    onClose,
    title,
    artist,
    album,
    coverStyle,
    buttonList,
    duration,
    playInfo,
    indexLabel,
    isPlaying,
    volume,
    volumeChangedTime,
    volumeSliderShow,
    analyserNode,
    onProgressChange,
    onCloseVolumeSlider,
    onVolumeChange,
  } = props

  const {
    userConfig,
    setUserConfig,
    userConfig: {
      musicPlayerCoverDisk,
    },
  } = useUserConfig()

  return (
    <>
      <Modal
        fullScreen
        header={null}
        footer={null}
        visible={show}
        className="gagu-sync-popstate-overlay gagu-app-music-player-immersive-theatre bg-red-500"
        onCancel={onClose}
      >
        <div
          className="absolute z-0 inset-0 bg-cover bg-center bg-gradient-to-br from-pink-700 to-pink-900"
          style={coverStyle}
        />
        <div className="absolute z-10 inset-0 bg-black bg-opacity-50 backdrop-blur-2xl flex">

          <VolumeIndicator volume={volume} time={volumeChangedTime} />

          <div className="absolute top-0 right-0 p-2 md:p-3">
            <IconButton
              icon={<SvgIcon.Close size={24} />}
              onClick={onClose}
              className="gagu-sync-popstate-overlay-close-button text-white text-opacity-40"
            />
          </div>

          <div className="p-4 md:p-12 lg:p-20 flex flex-grow flex-wrap lg:flex-nowrap">

            <div className="flex-shrink-0 w-full h-1/2 lg:w-1/2 lg:h-full flex justify-center items-center">
              <div
                className={line(`
                  w-full max-w-[60%] lg:max-w-[75%] aspect-square cursor-pointer
                  bg-center bg-cover bg-no-repeat
                  flex justify-center items-center
                  ${musicPlayerCoverDisk
                    ? `rounded-full ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`
                    : 'border-4 border-white bg-white bg-opacity-10'
                  }
                `)}
                style={musicPlayerCoverDisk
                  ? { background: 'repeating-radial-gradient(#222 0%, #000 1%)' }
                  : coverStyle
                }
                onClick={() => setUserConfig({ ...userConfig, musicPlayerCoverDisk: !musicPlayerCoverDisk })}
              >
                {musicPlayerCoverDisk && (
                  <div
                    className="w-3/5 h-3/5 rounded-full bg-center bg-no-repeat bg-cover border-4 border-black"
                    style={coverStyle}
                  />
                )}
              </div>
            </div>

            <div className="flex-shrink-0 w-full h-1/2 lg:w-1/2 lg:h-full flex justify-center items-center">
              <div className="relative w-full max-w-[75%] max-h-[75%] aspect-square text-white text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-90">{title}</div>
                <div className="mt-2 md:mt-4 lg:mt-6 text-lg md:text-xl lg:text-2xl xl:text-3xl opacity-60">{album} - {artist}</div>

                <div className="absolute right-0 bottom-0 left-0 select-none">
                  <div className="py-4 md:py-6 lg:py-8">
                    <div className="w-full h-16 md:h-24 lg:h-32">
                      <SpectrumCanvas
                        color="white"
                        opacity={.2}
                        analyserNode={analyserNode}
                      />
                    </div>
                    <ProgressSlider
                      duration={duration}
                      playPercent={playInfo.playPercent}
                      frontAndBackColorClassNames={['bg-white bg-opacity-90', 'bg-white bg-opacity-50']}
                      onProgressClick={onProgressChange}
                    />
                    <div className="mt-2 flex justify-between font-din opacity-40 text-xs md:text-base">
                      <div>{indexLabel}</div>
                      <div>{playInfo.currentTimeLabel}/{playInfo.durationLabel}</div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="relative flex items-center">
                      {buttonList.map(({ title, icon, onClick }) => (
                        <IconButton
                          key={title}
                          icon={icon}
                          title={title}
                          size="xl"
                          onClick={onClick}
                        />
                      ))}
                      <VolumeSlider
                        show={volumeSliderShow}
                        volume={volume}
                        right={8}
                        bottom={50}
                        onClose={onCloseVolumeSlider}
                        onVolumeChange={onVolumeChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
