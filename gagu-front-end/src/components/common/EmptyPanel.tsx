import { line } from '../../utils'
import { SvgIcon } from './SvgIcon'

interface EmptyPanelProps {
  visible: boolean
  dark?: boolean
}

export function EmptyPanel(props: EmptyPanelProps) {
  const {
    visible,
    dark = false,
  } = props

  return visible ? (
    <div
      className={line(`
        flex-center-center
        absolute inset-0
        ${dark ? 'text-black/10' : 'text-gray-100 dark:text-zinc-700'}
      `)}
    >
      <SvgIcon.G size={64} />
    </div>
  ) : <></>
}
