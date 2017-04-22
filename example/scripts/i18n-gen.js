'use strict'
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const mkdirp = require('mkdirp')
const merge = require('lodash.merge')
const extractReactIntl = require('extract-react-intl')

const pFs = pify(fs)

const FILES_TO_PARSE = 'app/**/!(*.test).js'

async function main(locales, buildDir, defaultLocale = 'en') {
  mkdirp.sync(buildDir)
  const oldLocaleMappings = {}

  // Store existing translations into memory
  for (const locale of locales) {
    oldLocaleMappings[locale] = {}
    const translationFileName = path.resolve(buildDir, `${locale}.json`)

    try {
      const messages = JSON.parse(fs.readFileSync(translationFileName))
      for (const messageKey of Object.keys(messages)) {
        oldLocaleMappings[locale][messageKey] = messages[messageKey]
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        fs.writeFileSync(translationFileName, '{}', 'utf8')
      } else {
        throw err
      }
    }
  }

  const newLocaleMappings = await extractReactIntl(locales, FILES_TO_PARSE, {
    defaultLocale,
  })
  const localeMappings = merge(newLocaleMappings, oldLocaleMappings)

  for (const locale of locales) {
    const translationFileName = `${buildDir}/${locale}.json`

    let messages = {}
    Object.keys(localeMappings[locale]).sort().forEach(function(key) {
      messages[key] = localeMappings[locale][key]
    })

    const prettified = `${JSON.stringify(messages, null, 2)}\n`
    console.log(prettified)

    await pFs.writeFile(translationFileName, prettified, 'utf8')
  }
}

const locales = ['en', 'ja', 'de']
const buildDir = 'app/translations'

main(locales, buildDir, 'en')
