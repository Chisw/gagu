import { useEffect } from 'react'

interface useShortcutsProps {
  type: 'keydown' | 'keyup'
  bindCondition: boolean
  shortcutMap: {[KEY: string]: any}  // null | () => void
}

export default function useShortcuts(props: useShortcutsProps) {

  const {
    type,
    bindCondition,
    shortcutMap,
  } = props

  useEffect(() => {
    const shortcutKeys = Object.keys(shortcutMap)
    const listener = (e: any) => {
      const { key, shiftKey } = e
      const shortcut = `${shiftKey ? 'Shift+' : ''}${key}`

      if (shortcutKeys.includes(shortcut)) {
        const fn = shortcutMap[shortcut]
        fn && fn()
      }
    }
    const bind = () => document.addEventListener(type, listener)
    const unbind = () => document.removeEventListener(type, listener)
    bindCondition ? bind() : unbind()
    return unbind
  }, [type, bindCondition, shortcutMap])
}
