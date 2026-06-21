import { throttle } from 'lodash-es'
import { useEffect, useState } from 'react'
import { IBrowserWindowSize } from '../types'

const MENU_BAR_HEIGHT = 32
const DOC_OFFSET = 48 + 4

export function useBrowserWindowSize() {
  const [size, setSize] = useState<IBrowserWindowSize>({
    MENU_BAR_HEIGHT,
    DOC_OFFSET,
    width: 1920,
    height: 1080,
    safeHeight: 1080,
  })

  useEffect(() => {
    const listener = throttle(() => {
      const { innerWidth: width, innerHeight: height } = window
      const safeHeight = height - MENU_BAR_HEIGHT - DOC_OFFSET
      setSize((size) => ({ ...size, width, height, safeHeight }))
    }, 50)

    listener()

    window.addEventListener('resize', listener)

    return () => {
      listener.cancel?.()
      window.removeEventListener('resize', listener)
    }
  }, [])

  return size
}
