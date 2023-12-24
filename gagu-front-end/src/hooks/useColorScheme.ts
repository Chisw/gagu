import { useEffect } from 'react'
import { useUserConfig } from './useUserConfig'
import { ColorScheme } from '../types'

const toggleDocumentColorScheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.body.setAttribute('theme-mode', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.removeAttribute('theme-mode')
  }
}

export function useColorScheme() {
  const { userConfig: { colorScheme } } = useUserConfig()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const isDark = colorScheme === ColorScheme.auto
      ? media.matches
      : colorScheme === ColorScheme.dark

    toggleDocumentColorScheme(isDark)

    const listener = (e: any) => {
      if (colorScheme !== ColorScheme.auto) return
      toggleDocumentColorScheme(e.matches)
    }

    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)

  }, [colorScheme])
}
