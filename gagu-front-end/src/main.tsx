import ReactDOM from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import App from './App'
import './i18n'

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <RecoilRoot>
      <App />
  </RecoilRoot>
)
