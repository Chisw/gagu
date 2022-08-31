import { ReactNode, useState } from 'react'
import { EntryType } from '../types'
import { line } from '../utils'

interface EntrySelectorProps {
  trigger: ReactNode
  multiple?: boolean
  only?: EntryType.directory | EntryType.file
}

export default function EntrySelector(props: EntrySelectorProps) {

  const {
    trigger,
    // multiple = false,
    // only = false,
  } = props

  const [show, setShow] = useState(false)

  return (
    <>
      <span
        onClick={() => setShow(true)}
      >
        {trigger}
      </span>

      <div
        className={line(`
          absolute z-10 inset-0 bg-black-300
          ${show ? 'block' : 'hidden'}
        `)}
        onClick={() => setShow(false)}
      >
        s
      </div>
    </>
  )
}
