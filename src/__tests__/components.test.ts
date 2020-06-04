import path from 'path'
import { cases } from '../utils/testUtils'

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

const allSupportedComponentsTest = {
  title: 'import all supported components',
  code: `
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

<FormattedHTMLMessage defaultMessage="<span>hello</span>" />;
<FormattedMessage defaultMessage="hello" />;
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
  error: /\[React Intl Auto\] defaultMessage must be statically evaluate-able for extraction/u,
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
const props = {
  defaultMessage: 'hello'
};
<FormattedMessage {...props} />;
`,
}

const keyTest = {
  title: 'using key',
  code: `
import { FormattedMessage } from 'react-intl';

<FormattedMessage key="foobar" defaultMessage="hello" />;
`,
}

const tests = [
  defaultTest,
  multiUseTest,
  allSupportedComponentsTest,
  withValueInMessageTest,
  withVariableMessageTest,
  importAsTest,
  nestedJSXTest,
  throwWhenNotAnalyzableTest,
  notTransformIfNotImportedTest,
  notTransformIfSpreadAttributeTest,
  keyTest,
]

cases(filename, [
  { title: 'default', tests },
  {
    title: 'useKey = true',
    tests: [defaultTest, keyTest],
    pluginOptions: { useKey: true },
  },

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

  {
    title: 'removePrefix = /__fixtures__/',
    tests: [defaultTest],
    pluginOptions: { removePrefix: /[\\/]__fixtures__/u },
  },

  {
    title: 'removePrefix = "src.__fixtures__"',
    tests: [defaultTest],
    pluginOptions: { removePrefix: 'src.__fixtures__' },
  },

  {
    title: 'removeDefaultMessage = true',
    tests: [defaultTest],
    pluginOptions: { removeDefaultMessage: true },
  },
])
