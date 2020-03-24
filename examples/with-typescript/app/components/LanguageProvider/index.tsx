import * as React from 'react'
import { addLocaleData, IntlProvider } from 'react-intl'

import * as enLocaleData from 'react-intl/locale-data/en'
import * as jaLocaleData from 'react-intl/locale-data/ja'

import enMessages from '../../translations/en.json'
import jaMessages from '../../translations/ja.json'

addLocaleData(enLocaleData)
addLocaleData(jaLocaleData)

const messages: {
  [key: string]: {}
} = {
  en: enMessages,
  ja: jaMessages,
}

export default class LanguageProvider extends React.Component<{
  locale?: string
}> {
  state: { locale: string } = { locale: 'en' }

  render() {
    const { locale } = this.state
    return (
      <div>
        <IntlProvider locale={locale} messages={messages[locale]}>
          {this.props.children}
        </IntlProvider>
        <a onClick={() => this.setState({ locale: 'en' })}>English</a>/
        <a onClick={() => this.setState({ locale: 'ja' })}>日本語</a>
      </div>
    )
  }
}
