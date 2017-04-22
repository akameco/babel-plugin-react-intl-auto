// @flow
import React, { Component } from 'react'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import jaLocaleData from 'react-intl/locale-data/ja'

import enMessages from '../../translations/en.json'
import jaMessages from '../../translations/ja.json'

addLocaleData(enLocaleData)
addLocaleData(jaLocaleData)

const messages = {
  en: enMessages,
  ja: jaMessages,
}

export default class LanguageProvider extends Component {
  props: { children?: React$Element<*> }
  state: { locale: string } = { locale: 'en' }

  render() {
    const { locale } = this.state
    return (
      <div>
        <IntlProvider locale={locale} messages={messages[locale]}>
          {this.props.children}
        </IntlProvider>

        <a onClick={() => this.setState({ locale: 'en' })}>English</a>
        /
        <a onClick={() => this.setState({ locale: 'ja' })}>日本語</a>
      </div>
    )
  }
}
