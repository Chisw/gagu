import { useEffect } from 'react'
import { useUserConfig } from './useUserConfig'
import { HotkeyStyle } from '../types'

interface useHotKeyProps {
  binding: boolean
  fnMap: {[KEY: string]: any}  // null | () => void
}

export function useHotKey(props: useHotKeyProps) {
  const {
    binding,
    fnMap,
  } = props

  const { userConfig: { hotkeyStyle } } = useUserConfig()

  useEffect(() => {
    const fnKeyList = Object.keys(fnMap)

    const listener = (e: any) => {
      if (document.querySelector('.gagu-prevent-hotkeys-overlay')) return

      const { code, altKey, ctrlKey, metaKey, shiftKey } = e

      const pressedHotKey = [
        ctrlKey ? 'Ctrl+' : '',
        metaKey ? 'Meta+' : '',
        altKey ? 'Alt+' : '',
        shiftKey ? 'Shift+' : '',
        code,
      ].join('')

      const styleIndex = {
        [HotkeyStyle.mac]: 0,
        [HotkeyStyle.win]: 1,
      }[hotkeyStyle]

      const fnKey = fnKeyList.find(key => key.split(', ')[styleIndex] === pressedHotKey)

      if (fnKey) {
        e.preventDefault()
        fnMap[fnKey] && fnMap[fnKey]()
      }
    }

    const bind = () => document.addEventListener('keydown', listener)
    const unbind = () => document.removeEventListener('keydown', listener)

    binding ? bind() : unbind()

    return unbind
  }, [binding, fnMap, hotkeyStyle])

}
