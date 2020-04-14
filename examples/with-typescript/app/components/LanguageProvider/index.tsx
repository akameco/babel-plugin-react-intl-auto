import * as React from 'react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../translations/en.json'
import jaMessages from '../../translations/ja.json'

const messages: {
  [key: string]: {}
} = {
  en: enMessages,
  ja: jaMessages,
}

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [locale, setLocale] = React.useState('en')

  return (
    <div>
      <IntlProvider locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
      <a onClick={() => setLocale('en')}>English</a>/
      <a onClick={() => setLocale('ja')}>日本語</a>
    </div>
  )
}
