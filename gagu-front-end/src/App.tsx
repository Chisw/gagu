import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DesktopPage from './pages/DesktopPage'
import ExplorePage from './pages/ExplorePage'
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
    <BrowserRouter>
      <Toaster
        containerClassName="break-all"
        toastOptions={{ className: 'dark:bg-zinc-700 dark:text-zinc-200' }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DesktopPage />} />
        <Route path="/desktop" element={<DesktopPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/touch" element={<TouchPage />} />
        <Route path="/sharing" element={<DesktopPage />} />
        <Route path="/sharing/:code" element={<SharingPage />} />
        <Route path="*" element={<DesktopPage />} />
      </Routes>
    </BrowserRouter>
  )
}
