import { SvgIcon } from './SvgIcon'

interface EmptyPanelProps {
  show: boolean
}

export function EmptyPanel(props: EmptyPanelProps) {
  const { show } = props

  return show ? (
    <div className="absolute inset-0 flex justify-center items-center text-gray-100">
      <SvgIcon.G size={64} />
    </div>
  ) : <></>
}
