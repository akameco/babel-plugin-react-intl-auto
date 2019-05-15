// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '..'

const filename = path.resolve(__dirname, '..', '__fixtures__', 'messages.js')

const defaultTest = {
  title: 'use static prefix instead of path to file',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages('customStaticPrefix', {
  hello: 'hello',
})
`,
}

const emptyStaticPrefixTest = {
  title: 'ignore empty static prefix',
  code: `
import { defineMessages } from 'react-intl'

export default defineMessages('', {
  hello: 'hello',
})
`,
}

const multiExportTest = {
  title: 'multi export',
  code: `
import { defineMessages } from 'react-intl'

export const extra = defineMessages('customStaticPrefix', {
  hello: 'hello world extra'
})

export default defineMessages('anotherCustomPrefix', {
  hello: 'hello world',
})
`,
}

const multiExportWithTheSamePrefixTest = {
  title: 'multi export with the same prefix',
  code: `
import { defineMessages } from 'react-intl'

export const extra = defineMessages('customStaticPrefix', {
  hello: 'hello world extra'
})

export default defineMessages('customStaticPrefix', {
  hello: 'hello world',
})
`,
}

const tests = [
  defaultTest,
  emptyStaticPrefixTest,
  multiExportTest,
  multiExportWithTheSamePrefixTest,
]

cases([{ title: 'default', tests }])

function cases(
  testCases: Array<{
    title: string,
    tests: $ReadOnlyArray<{ title: string, code: string }>,
  }>
) {
  const defaultOptions = {
    title: '',
    plugin,
    snapshot: true,
    babelOptions: { filename },
    tests: [],
  }
  for (const testCase of testCases) {
    testCase.tests = testCase.tests.map(t => ({ ...t, title: t.title }))
    pluginTester({ ...defaultOptions, ...testCase })
  }
}
