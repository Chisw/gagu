import { useEffect } from 'react'

interface useHotKeyProps {
  type: 'keydown' | 'keyup'
  binding: boolean
  hotKeyMap: {[KEY: string]: any}  // null | () => void
}

export function useHotKey(props: useHotKeyProps) {
  const {
    type,
    binding,
    hotKeyMap,
  } = props

  useEffect(() => {
    const hotKeyList = Object.keys(hotKeyMap)
    const listener = (e: any) => {
      e.preventDefault()
      const { key, shiftKey } = e
      const hotKey = `${shiftKey ? 'Shift+' : ''}${key}`
      // console.log({ key, shiftKey })
      if (hotKeyList.includes(hotKey)) {
        const fn = hotKeyMap[hotKey]
        fn && fn()
      }
    }
    const bind = () => document.addEventListener(type, listener)
    const unbind = () => document.removeEventListener(type, listener)
    binding ? bind() : unbind()
    return unbind
  }, [type, binding, hotKeyMap])
}
