'use strict'
const extractReactIntlMessages = require('extract-react-intl-messages')

const locales = ['en', 'ja']
const pattern = 'app/**/!(*.test).js'
const buildDir = 'app/translations'
const defaultLocale = 'en'

extractReactIntlMessages(locales, pattern, buildDir, { defaultLocale }).then(() => {
  console.log('finish')
})
