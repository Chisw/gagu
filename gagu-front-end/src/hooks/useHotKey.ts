import { useEffect } from 'react'

interface useHotKeyProps {
  binding: boolean
  hotKeyMap: {[KEY: string]: any}  // null | () => void
}

export function useHotKey(props: useHotKeyProps) {
  const {
    binding,
    hotKeyMap,
  } = props

  useEffect(() => {
    const hotKeyList = Object.keys(hotKeyMap)

    const listener = (e: any) => {
      e.preventDefault()
      const { key, shiftKey } = e
      const pressedHotKey = `${shiftKey ? 'Shift+' : ''}${key}`
      // console.log({ key, shiftKey })
      if (hotKeyList.includes(pressedHotKey)) {
        const fn = hotKeyMap[pressedHotKey]
        fn && fn()
      }
    }

    const bind = () => document.addEventListener('keyup', listener)
    const unbind = () => document.removeEventListener('keyup', listener)

    binding ? bind() : unbind()

    return unbind
  }, [binding, hotKeyMap])
}
