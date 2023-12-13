import { throttle } from 'lodash-es'
import { useEffect, useState } from 'react'

export function useWindowSize(isTouchMode: boolean) {
  const [size, setSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const listener = throttle(() => {
      const { innerWidth: width, innerHeight } = window
      const menuBarHeight = document.querySelector('.gagu-menu-bar')?.scrollHeight || 24
      const dockHeight = 40
      setSize({ width, height: innerHeight - menuBarHeight - (isTouchMode ? 0 : dockHeight) })
    })
    listener()
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [isTouchMode])

  return size
}
