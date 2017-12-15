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

const defaultTest = {
  title: 'default',
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

const leadingCommentTest = {
  title: 'leading comment',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages({
  // The main Hello of our app.
  hello: 'hello',

  // Another Hello,
  // multiline this time
  world: {
    id: 'hello.world',
    defaultMessage: 'hello world',
  }
})
`,
}

const leadingCommentWithDescriptionTest = {
  title: 'leading comment with description',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages({

  // This comment should not be used
  world: {
    defaultMessage: 'hello world',
    description: 'The hello world',
  }
})
`,
}

const tests = [
  defaultTest,
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
  {
    title: 'throw error when key is NumiricLiteral',
    code: `
import { defineMessages } from 'react-intl'

export default defineMessages({
  1: 'hello',
})
`,
    error: /requires Object key or string literal/,
    snapshot: false,
  },
  {
    title: 'not transform if defineMessages is not imported',
    code: `
export default defineMessages({
  hello: 'hello',
  world: 'hello world',
})
    `,
  },
  {
    title: 'not transform when defineMessages argumens is not object',
    code: `
import { defineMessages } from 'react-intl'

export default defineMessages(1)
    `,
  },
  {
    title: 'when using the variable',
    code: `
import { defineMessages } from 'react-intl'

const messages = {hello: 'hello'}

export default defineMessages(messages)
    `,
  },
  {
    title: 'not transfrom when the variable can not be found',
    code: `
import { defineMessages } from 'react-intl'

export default defineMessages(messages)
    `,
  },
  {
    title: 'not transform when react-intl is not imported',
    code: `
import any from 'any-module'

export default defineMessages({
  hello: 'hello',
  world: 'hello world',
})
    `,
  },
  leadingCommentTest,
  leadingCommentWithDescriptionTest,
]

type PTestOpts = {
  title: string,
  tests: $ReadOnlyArray<{ title: string, code: string }>,
}

function pTest(opts: PTestOpts) {
  const defaultOpts = {
    title: '',
    plugin,
    snapshot: true,
    babelOptions: { filename },
    tests: [],
  }
  opts.tests = opts.tests.map(t => {
    return { ...t, title: `${opts.title} - ${t.title}` }
  })
  pluginTester({ ...defaultOpts, ...opts })
}

pTest({ title: 'default', tests })

pTest({
  title: 'removePrefix = "src"',
  tests: [defaultTest],
  pluginOptions: { removePrefix: 'src' },
})

pTest({
  title: 'removePrefix = "src/" -- with slash',
  tests: [defaultTest],
  pluginOptions: { removePrefix: 'src/' },
})

pTest({
  title: 'filebase = true',
  tests: [defaultTest],
  pluginOptions: { filebase: true },
})

pTest({
  title: 'includeExportName = true',
  tests: [defaultTest, multiExportTest],
  pluginOptions: { includeExportName: true },
})

pTest({
  title: 'includeExportName = all',
  tests: [defaultTest, multiExportTest],
  pluginOptions: { includeExportName: 'all' },
})

pTest({
  title: 'removePrefix = true, includeExportName = true',
  tests: [defaultTest, multiExportTest],
  pluginOptions: { removePrefix: true, includeExportName: true },
})

pTest({
  title: 'removePrefix = false',
  tests: [defaultTest, multiExportTest],
  pluginOptions: { removePrefix: false },
})

pTest({
  title: 'removePrefix = true, includeExportName = all',
  tests: [defaultTest, multiExportTest],
  pluginOptions: { removePrefix: true, includeExportName: 'all' },
})

pTest({
  title: 'extractComments = false',
  tests: [defaultTest, leadingCommentTest, leadingCommentWithDescriptionTest],
  pluginOptions: { extractComments: false },
})
