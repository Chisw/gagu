import { useEffect } from 'react'
import { getImageTypeBase64ByURL } from '../utils'

export default function useFavicon(img: string) {
  useEffect(() => {
    getImageTypeBase64ByURL(img, { width: 32, height: 32, usePNG: true }).then(base64 => {
      const link: any = document.querySelector('link[rel*=icon]') || document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = base64
      document.getElementsByTagName('head')[0].appendChild(link)
    })
  }, [img])
}
