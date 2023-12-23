import { SvgIcon } from '../../../components/common'

interface VolumeIconProps {
  volume: number
  size: number
}

export default function VolumeIcon({ volume, size }: VolumeIconProps) {
    if (volume > .5) {
      return <SvgIcon.VolumeUp size={size} />
    } else if (volume === 0) {
      return <SvgIcon.VolumeMute size={size} />
    } else {
      return <SvgIcon.VolumeDown size={size} />
    }
}
