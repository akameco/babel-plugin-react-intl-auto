// @flow
import { resolve } from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '../'

const rootPath = resolve(__dirname, '../__fixtures__')
const filename = resolve(rootPath, 'messages.js')

const basicTest = {
  title: 'basic',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages({
  hello: 'hello',
  world: 'hello world',
})
      `,
}

const multiExportTest = {
  title: 'multi export',
  code: `
import { defineMessages } from 'react-intl'

export const extra = defineMessages({
  hello: 'hello extra',
  world: 'hello world extra',
})

export default defineMessages({
  hello: 'hello',
  world: 'hello world',
})
`,
}

const tests = [
  basicTest,
  {
    title: 'with include value',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  hello: 'hello',
  world: \`hello world \${1}\`,
})
      `,
  },
  {
    title: 'string literal',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  'hello': 'hello',
  'world': 'hello world',
})
      `,
  },
  {
    title: 'Object',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  new: {
    id: 'this is id',
    defaultMessage: 'id',
  },
  world: {
    defaultMessage: 'world',
  },
  headerTitle: {
    defaultMessage: 'Welcome to dashboard {name}!',
    description: 'Message to greet the user.',
  },
})
      `,
  },
  {
    title: 'import as',
    code: `
import { defineMessages as m } from 'react-intl'

m({
  hello: 'hello',
  world: 'hello world',
})

`,
  },
  {
    title: 'with other func',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  hello: 'hello',
  world: \`hello world \${1}\`,
})

hello({
  id: 'hoge',
})
    `,
  },
  multiExportTest,
]

const defaultOpts = {
  plugin,
  snapshot: true,
  babelOptions: { filename },
}

pluginTester({
  ...defaultOpts,
  tests,
})

pluginTester({
  ...defaultOpts,
  title: 'removePrefix = "src"',
  tests,
  pluginOptions: { removePrefix: 'src' },
})

pluginTester({
  ...defaultOpts,
  title: 'removePrefix = "src/" -- with slash',
  tests,
  pluginOptions: { removePrefix: 'src/' },
})

pluginTester({
  ...defaultOpts,
  title: 'filebase = true',
  tests,
  pluginOptions: { filebase: true },
})

pluginTester({
  ...defaultOpts,
  title: 'includeExportName = true',
  tests: [basicTest, multiExportTest],
  pluginOptions: { includeExportName: true },
})

pluginTester({
  ...defaultOpts,
  title: 'includeExportName = all',
  tests: [basicTest, multiExportTest],
  pluginOptions: { includeExportName: 'all' },
})
