import { useMemo } from 'react'
import { IEntry } from '../../types'
import { getEntryPath, getReadableSize, line } from '../../utils'

interface BottomBarProps {
  content: string
  kiloSize: 1000 | 1024
  activeEntry?: IEntry
}

export default function BottomBar(props: BottomBarProps) {

  const {
    content,
    kiloSize,
    activeEntry,
  } = props

  const { filePath, fileSize } = useMemo(() => {
    const filePath = getEntryPath(activeEntry)
    const fileSize = getReadableSize(new Blob([content]).size, kiloSize)
    return { filePath, fileSize }
  }, [activeEntry, kiloSize, content])

  return (
    <div
      className={line(`
        relative z-10
        px-2 h-5 text-xs bg-gray-100 text-gray-500 border-t
        justify-between items-center
        dark:bg-zinc-700 dark:text-zinc-400 dark:border-zinc-600
        ${activeEntry ? 'flex' : 'hidden'}
      `)}
    >
      <div
        className="truncate"
        title={filePath}
      >
        {filePath}
      </div>
      <div className="ml-2 font-din opacity-70">
        {fileSize}
      </div>
    </div>
  )
}
