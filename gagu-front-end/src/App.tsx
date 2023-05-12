import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DesktopPage from './pages/DesktopPage'
import ExplorePage from './pages/ExplorePage'
import TouchPage from './pages/TouchPage'
import SharePage from './pages/SharePage'
import { FsApi } from './api'
import { setFavicon } from './utils'
import './css/index.css'

export default function App() {

  useEffect(() => {
    setFavicon(FsApi.getBackgroundStreamUrl('favicon'))
  }, [])

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DesktopPage />} />
        <Route path="/desktop" element={<DesktopPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/touch" element={<TouchPage />} />
        <Route path="/share" element={<DesktopPage />} />
        <Route path="/share/:code" element={<SharePage />} />
        <Route path="*" element={<DesktopPage />} />
      </Routes>
    </BrowserRouter>
  )
}
