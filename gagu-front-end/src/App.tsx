import './css/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DesktopPage from './pages/DesktopPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesktopPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="*" render={() => <Redirect to="/404" />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
