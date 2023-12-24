import { line } from '../../utils'
import { SvgIcon } from './SvgIcon'

interface EmptyPanelProps {
  show: boolean
  dark?: boolean
}

export function EmptyPanel(props: EmptyPanelProps) {
  const {
    show,
    dark = false,
  } = props

  return show ? (
    <div
      className={line(`
        absolute inset-0 flex justify-center items-center
        ${dark ? 'text-black text-opacity-10' : 'text-gray-100 dark:text-zinc-700'}
      `)}
    >
      <SvgIcon.G size={64} />
    </div>
  ) : <></>
}
