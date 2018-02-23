# babel-plugin-react-intl-auto

[![Greenkeeper badge](https://badges.greenkeeper.io/akameco/babel-plugin-react-intl-auto.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/akameco/babel-plugin-react-intl-auto.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-react-intl-auto)
[![Build status](https://ci.appveyor.com/api/projects/status/5smedgke2ia9fpa0/branch/master?svg=true)](https://ci.appveyor.com/project/akameco/babel-plugin-react-intl-auto/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/akameco/babel-plugin-react-intl-auto/badge.svg?branch=master)](https://coveralls.io/github/akameco/babel-plugin-react-intl-auto?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors)

> i18n for the component age. Auto management react-intl ID.

[React Intl](https://github.com/yahoo/react-intl) is awesome. But, Global ID management is difficult and confusing.

Many projects, like [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate), give the ID to the name of the component as a prefix.
But it is redundant and troublesome.

This babel-plugin releases you from cumbersome ID management.
Based on the file path, this automatically generate a prefixed id.

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

```
$ npm install --save-dev babel-plugin-react-intl-auto
```

yarn

```
$ yarn add --dev babel-plugin-react-intl-auto
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

## Related

### [babel-plugin-react-intl-id-hash](https://github.com/adam-26/babel-plugin-react-intl-id-hash)

If you want short consistent hash values for the ID, you can use [react-intl-id-hash](https://github.com/adam-26/babel-plugin-react-intl-id-hash) in addition to this plugin to help reduce your applications bundle size.

### [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages)

Extract react-intl messages.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/4002137?v=4" width="100px;"/><br /><sub><b>akameco</b></sub>](http://akameco.github.io)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco "Code") [⚠️](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco "Tests") [👀](#review-akameco "Reviewed Pull Requests") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=akameco "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/112334?v=4" width="100px;"/><br /><sub><b>Aleksander Heintz</b></sub>](http://alxandr.me)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Alxandr "Code") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Alxandr "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/753919?v=4" width="100px;"/><br /><sub><b>Ryan Leckey</b></sub>](https://github.com/mehcode)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=mehcode "Code") | [<img src="https://avatars1.githubusercontent.com/u/2652619?v=4" width="100px;"/><br /><sub><b>Adam</b></sub>](https://github.com/adam-26)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=adam-26 "Code") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=adam-26 "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/1280915?v=4" width="100px;"/><br /><sub><b>Guylian Cox</b></sub>](https://ephys.github.io)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys "Code") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys "Documentation") [⚠️](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=Ephys "Tests") | [<img src="https://avatars1.githubusercontent.com/u/928407?v=4" width="100px;"/><br /><sub><b>Carl Grundberg</b></sub>](http://carlgrundberg.github.io/)<br />[💡](#example-carlgrundberg "Examples") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=carlgrundberg "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/1264276?v=4" width="100px;"/><br /><sub><b>bradbarrow</b></sub>](http://bradbarrow.com)<br />[💻](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow "Code") [📖](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow "Documentation") [⚠️](https://github.com/akameco/babel-plugin-react-intl-auto/commits?author=bradbarrow "Tests") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © [akameco](http://akameco.github.io)
