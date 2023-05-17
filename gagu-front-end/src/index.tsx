// import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { RecoilRoot } from 'recoil'
import './i18n'

ReactDOM.render(
  // <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>,
  // </React.StrictMode>,
  document.getElementById('root')
)
