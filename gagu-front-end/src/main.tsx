import ReactDOM from 'react-dom'
import App from './App'
import { RecoilRoot } from 'recoil'
import './i18n'

ReactDOM.render(
  <RecoilRoot>
      <App />
  </RecoilRoot>,
  document.getElementById('root')
)
