// @flow
import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '..'

const filename = path.resolve(__dirname, '..', '__fixtures__', 'messages.js')

const defaultTest = {
  title: 'default',
  code: `
import { FormattedMessage } from 'react-intl';

<FormattedMessage defaultMessage="hello" />;
`,
}

const multiUseTest = {
  title: 'multiple uses',
  code: `
import { FormattedMessage } from 'react-intl';

<FormattedMessage defaultMessage="hello" />;
<FormattedMessage defaultMessage="another" />;
`,
}

const withValueInMessageTest = {
  title: 'with a value interpolated in the message',
  code: `
import { FormattedMessage } from 'react-intl';

<FormattedMessage defaultMessage={\`hello world ${1 + 1}\`} />;
`,
}

const withVariableMessageTest = {
  title: 'with a variable as the defaultMessage',
  code: `
import { FormattedMessage } from 'react-intl';

const message = "variable message";

<FormattedMessage defaultMessage={message} />;
`,
}

const importAsTest = {
  title: 'with FormattedMessage imported as something else',
  code: `
import { FormattedMessage as T } from 'react-intl';

<T defaultMessage="hello" />;
`,
}

const nestedJSXTest = {
  title: 'with FormattedMessage nested in other JSX',
  code: `
import { FormattedMessage } from 'react-intl';

<div>
  <FormattedMessage defaultMessage="hello" />
</div>
`,
}

const throwWhenNotAnalyzableTest = {
  title: 'throws if defaultMessage isn’t analyzable',
  code: `
import { FormattedMessage } from 'react-intl';

const getMsg = () => 'hello';

<FormattedMessage defaultMessage={getMsg()} />;
`,
  error: /\[React Intl Auto\] Messages must be statically evaluate-able for extraction/,
  snapshot: false,
}

const notTransformIfNotImportedTest = {
  title: 'does nothing if components not imported from react-intl',
  snapshot: false,
  code: `
import any from 'any-module';

<FormattedMessage defaultMessage={getMsg()} />;
`,
}

const notTransformIfSpreadAttributeTest = {
  title: 'does nothing if component props are spread',
  snapshot: false,
  code: `
import { FormattedMessage } from 'react-intl';

const props = { defaultMessage: 'hello' };

<FormattedMessage {...props} />;
`,
}

const tests = [
  defaultTest,
  multiUseTest,
  withValueInMessageTest,
  withVariableMessageTest,
  importAsTest,
  nestedJSXTest,
  throwWhenNotAnalyzableTest,
  notTransformIfNotImportedTest,
  notTransformIfSpreadAttributeTest,
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
    tests: [defaultTest],
    pluginOptions: { includeExportName: true },
  },
  {
    title: 'includeExportName = all',
    tests: [defaultTest],
    pluginOptions: { includeExportName: 'all' },
  },
  {
    title: 'removePrefix = true, includeExportName = true',
    tests: [defaultTest],
    pluginOptions: { removePrefix: true, includeExportName: true },
  },
  {
    title: 'removePrefix = false',
    tests: [defaultTest],
    pluginOptions: { removePrefix: false },
  },
  {
    title: 'removePrefix = true, includeExportName = all',
    tests: [defaultTest],
    pluginOptions: { removePrefix: true, includeExportName: 'all' },
  },
  {
    title: 'extractComments = false',
    tests: [defaultTest],
    pluginOptions: { extractComments: false },
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
    babelOptions: { filename, parserOpts: { plugins: ['jsx'] } },
    tests: [],
  }
  for (const testCase of testCases) {
    testCase.tests = testCase.tests.map(t => ({ ...t, title: t.title }))
    pluginTester({ ...defaultOpts, ...testCase })
  }
}
