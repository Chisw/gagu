import './css/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DesktopPage from './pages/DesktopPage'
import LoginPage from './pages/LoginPage'
import { useFavicon } from './hooks'
import defaultFavicon from './img/favicon.png'

export default function App() {

  useFavicon(defaultFavicon)

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<DesktopPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="*" render={() => <Redirect to="/404" />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
