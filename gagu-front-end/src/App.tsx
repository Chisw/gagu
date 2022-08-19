import './css/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer, Flip } from 'react-toastify'
import DesktopPage from './pages/DesktopPage'
import LoginPage from './pages/LoginPage'
import useFavicon from './hooks/useFavicon'
import defaultFavicon from './img/icons/default-favicon.png'

export default function App() {

  useFavicon(defaultFavicon)

  return (
    <BrowserRouter>
      <ToastContainer
        hideProgressBar
        theme="colored"
        position="top-center"
        autoClose={1000}
        transition={Flip}
      />
      <Routes>
        <Route path="/" element={<DesktopPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="*" render={() => <Redirect to="/404" />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
