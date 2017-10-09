// @flow
import path from 'path'
import slash from 'slash'
import pluginTester from 'babel-plugin-tester'
import plugin from '../'

const filename = path.resolve(
  slash(__dirname),
  '..',
  '__fixtures__',
  'messages.js'
)

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

function pTest(opts: Object) {
  pluginTester(
    Object.assign(
      {
        plugin,
        snapshot: true,
        babelOptions: { filename },
      },
      opts
    )
  )
}

pTest({ tests })

pTest({
  title: 'removePrefix = "src"',
  tests,
  pluginOptions: { removePrefix: 'src' },
})

pTest({
  title: 'removePrefix = "src/" -- with slash',
  tests,
  pluginOptions: { removePrefix: 'src/' },
})

pTest({
  title: 'filebase = true',
  tests,
  pluginOptions: { filebase: true },
})

pTest({
  title: 'includeExportName = true',
  tests: [basicTest, multiExportTest],
  pluginOptions: { includeExportName: true },
})

pTest({
  title: 'includeExportName = all',
  tests: [basicTest, multiExportTest],
  pluginOptions: { includeExportName: 'all' },
})
