import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useFavicon } from './hooks'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DesktopPage from './pages/DesktopPage'
import ExplorePage from './pages/ExplorePage'
import TouchPage from './pages/TouchPage'
import SharePage from './pages/SharePage'
import defaultFavicon from './img/favicon.png'
import './css/index.css'

export default function App() {

  useFavicon(defaultFavicon)

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DesktopPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/touch" element={<TouchPage />} />
        <Route path="/share" element={<DesktopPage />} />
        <Route path="/share/:code" element={<SharePage />} />
        <Route path="*" element={<DesktopPage />} />
      </Routes>
    </BrowserRouter>
  )
}
