import { useEffect } from 'react'

interface useHotKeyProps {
  binding: boolean
  fnMap: {[KEY: string]: any}  // null | () => void
}

export function useHotKey(props: useHotKeyProps) {
  const {
    binding,
    fnMap,
  } = props

  useEffect(() => {
    const fnKeyList = Object.keys(fnMap)

    const listener = (e: any) => {
      e.preventDefault()

      const { code, altKey, ctrlKey, metaKey, shiftKey } = e

      const pressedHotKey = [
        ctrlKey ? 'Ctrl+' : '',
        metaKey ? 'Meta+' : '',
        altKey ? 'Alt+' : '',
        shiftKey ? 'Shift+' : '',
        code,
      ].join('')

      console.log(pressedHotKey, { code, altKey, ctrlKey, metaKey, shiftKey })

      const fnKey = fnKeyList.find(key => key.split(', ')[0] === pressedHotKey)

      if (fnKey) {
        const fn = fnMap[fnKey]
        fn && fn()
      }
    }

    const bind = () => document.addEventListener('keydown', listener)
    const unbind = () => document.removeEventListener('keydown', listener)

    binding ? bind() : unbind()

    return unbind
  }, [binding, fnMap])
}
