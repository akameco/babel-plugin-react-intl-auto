// @flow
import * as React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import LanguageProvider from './components/LanguageProvider'

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error(`#root not found`)
}

ReactDOM.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
  rootEl
)
