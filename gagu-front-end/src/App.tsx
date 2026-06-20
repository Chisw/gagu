import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DesktopPage from './pages/DesktopPage'
import ExplorerPage from './pages/ExplorerPage'
import TouchPage from './pages/TouchPage'
import SharingPage from './pages/SharingPage'
import { FsApi } from './api'
import { setFavicon } from './utils'
import { useColorScheme } from './hooks'
import './css/index.css'

export default function App() {

  useColorScheme()

  useEffect(() => {
    setFavicon(FsApi.getPublicImageStreamUrl('favicon'))
  }, [])

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DesktopPage />} />
        <Route path="/desktop" element={<DesktopPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/touch" element={<TouchPage />} />
        <Route path="/sharing" element={<DesktopPage />} />
        <Route path="/sharing/:code" element={<SharingPage />} />
        <Route path="*" element={<DesktopPage />} />
      </Routes>
    </BrowserRouter>
  )
}
