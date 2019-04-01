# babel-plugin-react-intl-auto

[![Build Status](https://travis-ci.org/akameco/babel-plugin-react-intl-auto.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-react-intl-auto)
[![Build status](https://ci.appveyor.com/api/projects/status/5smedgke2ia9fpa0/branch/master?svg=true)](https://ci.appveyor.com/project/akameco/babel-plugin-react-intl-auto/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/akameco/babel-plugin-react-intl-auto/badge.svg?branch=master)](https://coveralls.io/github/akameco/babel-plugin-react-intl-auto?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors)
[![babel-plugin-react-intl-auto Dev Token](https://badge.devtoken.rocks/babel-plugin-react-intl-auto)](https://devtoken.rocks/package/babel-plugin-react-intl-auto)

> i18n for the component age. Auto management react-intl ID.

[React Intl](https://github.com/yahoo/react-intl) is awesome. But, Global ID management is difficult and confusing.

Many projects, like [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate), give the ID to the name of the component as a prefix.
But it is redundant and troublesome.

This babel-plugin releases you from cumbersome ID management.
Based on the file path, this automatically generates a prefixed id.

Also, we strongly encourage you to use [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages).
You can generate json automatically.

Goodbye, global ID!!

#### Before

```js
import { defineMessages, FormattedMessage } from 'react-intl'

export default defineMessages({
  hello: {
    id: 'App.Components.Greeting.hello',
    defaultMessage: 'hello {name}',
  },
  welcome: {
    id: 'App.Components.Greeting.welcome',
    defaultMessage: 'Welcome!',
  },
})

const MyComponent = () => (
  <FormattedMessage
    id="App.Components.Greeting.goodbye"
    defaultMessage="goodbye {name}"
  />
)
```

#### After

With babel-plugin-react-intl-auto.

```js
import { defineMessages, FormattedMessage } from 'react-intl'

export default defineMessages({
  hello: 'hello {name}',
  welcome: 'Welcome!',
})

const MyComponent = () => <FormattedMessage defaultMessage="goodbye {name}" />
```

See [examples](https://github.com/akameco/babel-plugin-react-intl-auto/tree/master/examples).

### With `extract-react-intl-messages`

Example usage with [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages).

```
$ extract-messages -l=en -o translations 'src/**/*.js'
```

en.json

```json
{
  "components.App.hello": "hello {name}",
  "components.App.welcome": "Welcome",
  "components.App.189751785": "goodbye {name}" // unique hash of defaultMessage
}
```

## Install

npm

```shell
$ npm install --save-dev babel-plugin-react-intl-auto

# Optional: TypeScript support
$ npm install --save-dev @babel/plugin-transform-typescript
```

yarn

```shell
$ yarn add --dev babel-plugin-react-intl-auto

# Optional: TypeScript support
$ yarn add --dev @babel/plugin-transform-typescript
```

## Usage

.babelrc

```json
{
  "plugins": [
    [
      "react-intl-auto",
      {
        "removePrefix": "app/",
        "filebase": false
      }
    ]
  ]
}
```

### Options

#### removePrefix

remove prefix.

Type: `string | boolean` <br>
Default: `''`

if `removePrefix` is `true`, no file path prefix is included in the id.

##### Example (src/components/App/messages.js)

when `removePrefix` is `"src"`

```js
import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: 'hello world'
});

      ↓ ↓ ↓ ↓ ↓ ↓

import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: {
    id: 'components.App.hello',
    defaultMessage: 'hello world'
  }
});
```

when `removePrefix` is `"src.components"`

```js
import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: 'hello world'
});

      ↓ ↓ ↓ ↓ ↓ ↓

import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: {
    id: 'App.hello',
    defaultMessage: 'hello world'
  }
});
```

when `removePrefix` is `true`

```js
import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: 'hello world'
});

      ↓ ↓ ↓ ↓ ↓ ↓

import { defineMessages } from 'react-intl';

export default defineMessages({
  hello: {
    id: 'hello',
    defaultMessage: 'hello world'
  }
});
```

#### filebase

Type: `boolean` <br>
Default: `false`

if `filebase` is `true`, generate id with filename.

#### includeExportName

Type: `boolean | 'all'` <br>
Default: `false`

if `includeExportName` is `true`, adds named exports as part of the id.

Only works with `defineMessages`.

##### Example

```js
export const test = defineMessages({
  hello: 'hello {name}',
})

      ↓ ↓ ↓ ↓ ↓ ↓

export const test = defineMessages({
  hello: {
    id: 'path.to.file.test.hello',
    defaultMessage: 'hello {name}',
  },
})
```

If includeExportName is `'all'`, it will also add `default` to the id on default
exports.

#### extractComments

Use leading comments as the message description.

Only works with `defineMessages`

Type: `boolean` <br>
Default: `true`

##### Example

```js
export const test = defineMessages({
  // Message used to greet the user
  hello: 'hello {name}',
})

      ↓ ↓ ↓ ↓ ↓ ↓

export const test = defineMessages({
  hello: {
    id: 'path.to.file.test.hello',
    defaultMessage: 'hello {name}',
    description: 'Message used to greet the user',
  },
})
```

#### useKey

Only works with `FormattedMessage` and `FormattedHTMLMessage`. Instead of
generating an ID by hashing `defaultMessage`, it will use the `key` property if
it exists.

Type: `boolean` <br>
Default: `false`

##### Example

```js
<FormattedMessage key="foobar" defaultMessage="hello" />

      ↓ ↓ ↓ ↓ ↓ ↓

<FormattedMessage id="path.to.file.foobar" key="foobar" defaultMessage="hello" />
```

### Support variable

##### Example

```js
const messages = { hello: 'hello world' }

export default defineMessages(messages)

      ↓ ↓ ↓ ↓ ↓ ↓

const messages = {
  hello: {
    id: 'path.to.file.hello',
    defaultMessage: 'hello wolrd'
  }
};

export default defineMessages(messages);
```

## TypeScript

TypeScript support is bundled with this package. Be sure to include our type
definition and run `@babel/plugin-transform-typescript` beforehand. This way,
you can also be empowered by [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages).

### tsconfig.json

```json
{
  "include": ["node_modules/babel-plugin-react-intl-auto/**/*.d.ts"]
}
```

### .babelrc

```json
{
  "plugins": [["@babel/plugin-transform-typescript"], ["react-intl-auto"]]
}
```

### webpack.config.js

Use `babel-loader` along with `ts-loader` when using webpack as well.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
}
```

## Related

### [babel-plugin-react-intl-id-hash](https://github.com/adam-26/babel-plugin-react-intl-id-hash)

If you want short consistent hash values for the ID, you can use [react-intl-id-hash](https://github.com/adam-26/babel-plugin-react-intl-id-hash) in addition to this plugin to help reduce your applications bundle size.

### [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages)

Extract react-intl messages.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="http://akameco.github.io"><img src="https://avatars2.githubusercontent.com/u/4002137?v=4" width="100px;" alt="akameco"/><br /><sub><b>akameco</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco" title="Tests">⚠️</a> <a href="#review-akameco" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco" title="Documentation">📖</a></td><td align="center"><a href="http://alxandr.me"><img src="https://avatars0.githubusercontent.com/u/112334?v=4" width="100px;" alt="Aleksander Heintz"/><br /><sub><b>Aleksander Heintz</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Alxandr" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Alxandr" title="Documentation">📖</a></td><td align="center"><a href="https://github.com/mehcode"><img src="https://avatars1.githubusercontent.com/u/753919?v=4" width="100px;" alt="Ryan Leckey"/><br /><sub><b>Ryan Leckey</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=mehcode" title="Code">💻</a></td><td align="center"><a href="https://github.com/adam-26"><img src="https://avatars1.githubusercontent.com/u/2652619?v=4" width="100px;" alt="Adam"/><br /><sub><b>Adam</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=adam-26" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=adam-26" title="Documentation">📖</a></td><td align="center"><a href="https://ephys.github.io"><img src="https://avatars0.githubusercontent.com/u/1280915?v=4" width="100px;" alt="Guylian Cox"/><br /><sub><b>Guylian Cox</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys" title="Documentation">📖</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys" title="Tests">⚠️</a></td><td align="center"><a href="http://carlgrundberg.github.io/"><img src="https://avatars1.githubusercontent.com/u/928407?v=4" width="100px;" alt="Carl Grundberg"/><br /><sub><b>Carl Grundberg</b></sub></a><br /><a href="#example-carlgrundberg" title="Examples">💡</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=carlgrundberg" title="Documentation">📖</a></td><td align="center"><a href="http://bradbarrow.com"><img src="https://avatars3.githubusercontent.com/u/1264276?v=4" width="100px;" alt="bradbarrow"/><br /><sub><b>bradbarrow</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow" title="Documentation">📖</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow" title="Tests">⚠️</a></td></tr><tr><td align="center"><a href="https://github.com/mgtitimoli"><img src="https://avatars2.githubusercontent.com/u/4404683?v=4" width="100px;" alt="Mauro Gabriel Titimoli"/><br /><sub><b>Mauro Gabriel Titimoli</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=mgtitimoli" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=mgtitimoli" title="Tests">⚠️</a></td><td align="center"><a href="https://github.com/stanislav-ermakov"><img src="https://avatars2.githubusercontent.com/u/15980086?v=4" width="100px;" alt="Stanislav Ermakov"/><br /><sub><b>Stanislav Ermakov</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=stanislav-ermakov" title="Code">💻</a></td><td align="center"><a href="https://chitoku.jp/"><img src="https://avatars1.githubusercontent.com/u/6535425?v=4" width="100px;" alt="Chitoku"/><br /><sub><b>Chitoku</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=chitoku-k" title="Code">💻</a></td><td align="center"><a href="https://github.com/kuma-kuma"><img src="https://avatars0.githubusercontent.com/u/12218082?v=4" width="100px;" alt="Kouta Kumagai"/><br /><sub><b>Kouta Kumagai</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=kuma-kuma" title="Documentation">📖</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=kuma-kuma" title="Code">💻</a> <a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=kuma-kuma" title="Tests">⚠️</a></td><td align="center"><a href="http://shah.yar.gs"><img src="https://avatars0.githubusercontent.com/u/255846?v=4" width="100px;" alt="Shahyar G"/><br /><sub><b>Shahyar G</b></sub></a><br /><a href="https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=shahyar" title="Code">💻</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © [akameco](http://akameco.github.io)
