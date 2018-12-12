// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '..'

const filename = path.resolve(__dirname, '..', '__fixtures__', 'messages.js')

const defaultTest = {
  title: 'default',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages({
  hello: 'hello',
})
`,
}

const multiExportTest = {
  title: 'multi export',
  code: `
import { defineMessages } from 'react-intl'

export const extra = defineMessages({
  hello: 'hello world extra'
})

export default defineMessages({
  hello: 'hello world',
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
  hello: \`hello world \${1}\`,
})
      `,
  },
  {
    title: 'string literal',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  'hello': 'hello world'
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
  hello: 'hello'
})

`,
  },
  {
    title: 'with other func',
    code: `
import { defineMessages } from 'react-intl'

defineMessages({
  hello: 'hello',
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
import any from 'any-module'

export default defineMessages({
  hello: 'hello'
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
    title: 'not transform when defineMessages argumens is empty',
    code: `
import { defineMessages } from 'react-intl'

export default defineMessages()
    `,
  },
  {
    title: 'not transform if callee is not identifier',
    code: `
import { defineMessages } from 'react-intl'

const m = [defineMessages]

export default m[0]({
  hello: 'hello world'
})
    `,
  },
  {
    title: 'with other specifier',
    code: `
import { defineMessages, FormattedMessage } from 'react-intl'

export default defineMessages({
  hello: 'hello world',
})
    `,
  },
  leadingCommentTest,
  leadingCommentWithDescriptionTest,
  {
    title: 'eval string',
    // only: true,
    code: `
import { defineMessages } from 'react-intl'

export default defineMessages({
  hello: 'hello' + 'world',
})
    `,
  },
]

cases([
  { title: 'default', tests },
  {
    title: 'removePrefix = "src"',
    tests: [defaultTest],
    pluginOptions: { removePrefix: 'src' },
  },
  {
    title: 'removePrefix = "src/" -- with slash',
    tests: [defaultTest],
    pluginOptions: { removePrefix: 'src/' },
  },
  {
    title: 'filebase = true',
    tests: [defaultTest],
    pluginOptions: { filebase: true },
  },
  {
    title: 'includeExportName = true',
    tests: [defaultTest, multiExportTest],
    pluginOptions: { includeExportName: true },
  },
  {
    title: 'includeExportName = all',
    tests: [defaultTest, multiExportTest],
    pluginOptions: { includeExportName: 'all' },
  },
  {
    title: 'removePrefix = true, includeExportName = true',
    tests: [defaultTest, multiExportTest],
    pluginOptions: { removePrefix: true, includeExportName: true },
  },
  {
    title: 'removePrefix = false',
    tests: [defaultTest, multiExportTest],
    pluginOptions: { removePrefix: false },
  },
  {
    title: 'removePrefix = true, includeExportName = all',
    tests: [defaultTest, multiExportTest],
    pluginOptions: { removePrefix: true, includeExportName: 'all' },
  },
  {
    title: 'extractComments = false',
    tests: [defaultTest, leadingCommentTest, leadingCommentWithDescriptionTest],
    pluginOptions: { extractComments: false },
  },
  {
    title: 'removePrefix = /__fixtures__/',
    tests: [defaultTest],
    pluginOptions: { removePrefix: /src\/__f.+?_/, includeExportName: true },
  },
])

function cases(
  testCases: {
    title: string,
    tests: $ReadOnlyArray<{ title: string, code: string }>,
  }[]
) {
  const defaultOpts = {
    title: '',
    plugin,
    snapshot: true,
    babelOptions: { filename },
    tests: [],
  }
  for (const testCase of testCases) {
    testCase.tests = testCase.tests.map(t => ({ ...t, title: t.title }))
    pluginTester({ ...defaultOpts, ...testCase })
  }
}
