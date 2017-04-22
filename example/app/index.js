// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import LanguageProvider from './components/LanguageProvider'

ReactDOM.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
  document.getElementById('root')
)
