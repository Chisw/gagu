import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DesktopPage from './pages/DesktopPage'
import ExplorerPage from './pages/ExplorerPage'
import TouchPage from './pages/TouchPage'
import SharingPage from './pages/SharingPage'
import AppPage from './pages/AppPage'
import { FsApi } from './api'
import { setFavicon } from './utils'
import { useColorScheme } from './hooks'
import { SystemRuntime } from './system/SystemRuntime'
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
        <Route element={<SystemRuntime />}>
          <Route path="/" element={<DesktopPage />} />
          <Route path="/desktop" element={<DesktopPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/touch" element={<TouchPage />} />
          <Route path="/sharing" element={<DesktopPage />} />
          <Route path="/app/:appId" element={<AppPage />} />
          <Route path="*" element={<DesktopPage />} />
        </Route>
        <Route path="/sharing/:code" element={<SharingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
