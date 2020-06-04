import path from 'path'
import { cases } from '../utils/testUtils'

const filename = path.resolve(__dirname, '..', '__fixtures__', 'messages.js')

const defaultTest = {
  title: 'with useIntl hook imported',
  code: `
import { useIntl } from 'react-intl';

intl.formatMessage({ defaultMessage: "hello" });
  `,
}

const multiUseTest = {
  title: 'multiple uses',
  code: `
import { useIntl } from 'react-intl';

intl.formatMessage({ defaultMessage: "hello" });
intl.formatMessage({ defaultMessage: "hello" });
intl.formatMessage({ defaultMessage: "some other message" });
`,
}

const withValueInMessageTest = {
  title: 'with a value interpolated in the message',
  code: `
import { useIntl } from 'react-intl';

intl.formatMessage({ defaultMessage: \`template string ${1 + 1}\` });
`,
}

const withVariableMessageTest = {
  title: 'with a variable as the defaultMessage',
  code: `
import { useIntl } from 'react-intl';

const message = "variable message";

intl.formatMessage({ defaultMessage: message });
`,
}

const withVariableMessageDescriptor = {
  title: 'with a variable as the defaultMessage',
  code: `
import { useIntl } from 'react-intl';
import { message } from './messages'

intl.formatMessage(messages);
`,
}

const withCustomProperties = {
  title: 'with custom properties in formatMessage call',
  code: `
import { useIntl } from 'react-intl';

intl.formatMessage({ defaultMessage: "custom prop", other: 123 });
`,
}

const someSupportedUseCases = {
  title: 'some supported use cases',
  code: `
import { useIntl } from 'react-intl';

const Component2 = () => {
  const intl = useIntl();
  const label = intl.formatMessage({ defaultMessage: "hello" });
  return (
    <button aria-label={intl.formatMessage({ defaultMessage: "hello" })}>
      {intl.formatMessage({ defaultMessage: "hello" })}
    </button>
  );
};
  `,
}

const importAsTest = {
  title: 'with FormattedMessage imported as something else',
  code: `
import { useIntl as i18n } from 'react-intl';

intl.formatMessage({ defaultMessage: "i18n" });
`,
}

const throwWhenNotAnalyzableTest = {
  title: 'throws if defaultMessage isn’t analyzable',
  code: `
import { useIntl } from 'react-intl';
const getMsg = () => 'hello';
intl.formatMessage({
  defaultMessage: getMsg(),
});
`,
  error: /\[React Intl Auto\] defaultMessage must be statically evaluate-able for extraction/u,
  snapshot: false,
}

const notTransformIfNotImportedTest = {
  title: 'does nothing if react-intl is not imported',
  snapshot: false,
  code: `
import any from 'any-module';
intl.formatMessage({
  defaultMessage: "hello"
});
`,
}

const notTransformIfIdIsProvided = {
  title: 'does nothing if id is already provided',
  snapshot: false,
  code: `
import { useIntl } from 'react-intl';
intl.formatMessage({
  id: "my.custom.id",
  defaultMessage: "hello"
});
`,
}

const injectIntlWithProps = {
  title: 'with injectIntl',
  code: `
import { injectIntl } from 'react-intl';
function App({ intl }) {
  return <div>{intl.formatMessage({ defaultMessage: 'hello' })}</div>
}

export default injectIntl(App)
  `,
}

const withKeyFlag = {
  title: 'withKeyFlag',
  code: `
import { useIntl } from 'react-intl';
intl.formatMessage({
  key: 'foobar',
  defaultMessage: 'hello'
});
  `,
}

const tests = [
  defaultTest,
  multiUseTest,
  withValueInMessageTest,
  withVariableMessageTest,
  withVariableMessageDescriptor,
  withCustomProperties,
  someSupportedUseCases,
  importAsTest,
  throwWhenNotAnalyzableTest,
  notTransformIfNotImportedTest,
  notTransformIfIdIsProvided,
  injectIntlWithProps,
  withKeyFlag,
]

cases(filename, [
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

  // {
  //   title: 'includeExportName = true',
  //   tests: [defaultTest],
  //   pluginOptions: { includeExportName: true },
  // },
  // {
  //   title: 'includeExportName = all',
  //   tests: [defaultTest],
  //   pluginOptions: { includeExportName: 'all' },
  // },
  // {
  //   title: 'removePrefix = true, includeExportName = true',
  //   tests: [defaultTest],
  //   pluginOptions: { removePrefix: true, includeExportName: true },
  // },
  {
    title: 'removePrefix = false',
    tests: [defaultTest],
    pluginOptions: { removePrefix: false },
  },

  // {
  //   title: 'removePrefix = true, includeExportName = all',
  //   tests: [defaultTest],
  //   pluginOptions: { removePrefix: true, includeExportName: 'all' },
  // },
  // {
  //   title: 'extractComments = false',
  //   tests: [defaultTest],
  //   pluginOptions: { extractComments: false },
  // },
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
    title: 'useKey = true',
    tests: [defaultTest, withKeyFlag],
    pluginOptions: { useKey: true },
  },
  {
    title: 'removeDefaultMessage = true',
    tests: [defaultTest],
    pluginOptions: { removeDefaultMessage: true },
  },
])
