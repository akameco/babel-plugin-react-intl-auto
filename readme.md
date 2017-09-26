# babel-plugin-react-intl-auto [![Build Status](https://travis-ci.org/akameco/babel-plugin-react-intl-auto.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-react-intl-auto)

> i18n for the component age. Auto management react-intl ID.

[React Intl](https://github.com/yahoo/react-intl) is awesome. But, Global ID management is difficult and confusing.

Many projects, like [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate), give the ID to the name of the component as a prefix.
But it is redundant and troublesome.

This babel-plugin releases you from cumbersome ID management.
Based on the file path, this automatically generate a prefixed id.

Also, we strongly encourage you to use [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages).
You can generate json automatically.

Goodbye, global ID!!

### Before

```js
import { defineMessages } from 'react-intl'

export default defineMessages({
  hello: {
    id: 'App.Components.Greeting.hello',
    defaultMessage: 'hello {name}'
  },
  welcome: {
    id: 'App.Components.Greeting.welcome',
    defaultMessage: 'Welcome!'
  },
})
```

### After

With babel-plugin-react-intl-auto.

```js
import { defineMessages } from 'react-intl'

export default defineMessages({
  hello: 'hello {name}',
  welcome: 'Welcome!',
})
```

See [examples](https://github.com/akameco/babel-plugin-react-intl-auto/tree/master/example).

with [extract-react-intl-messages](https://github.com/akameco/extract-react-intl-messages).

```
$ extract-messages -l=en -o translations 'src/**/*.js'
```

en.json

```json
{
  "components.App.hello": "hello {name}",
  "components.App.welcome": "Welcome"
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
    ["react-intl-auto", {
      "removePrefix": "app/",
      "filebase": false
    }]
  ]
}
```

### Options

#### removePrefix

remove prefix.

Type: `string` <br>
Default: `''`

#### filebase
Type: `boolean` <br>
Default: `false`

if fileBase `true`, Generate id with filename.

#### includeExportName
Type: `boolean | 'all'` <br>
Default: `false`

if includeExportName is `true`, adds named exports as part of the id. Example:

```js
// before
export const test = defineMessages({
  hello: 'hello {name}',
})

// after
export const test = defineMessages({
  hello: {
    id: 'path.to.file.test.hello',
    defaultMessage: 'hello {name}',
  },
})
```

If includeExportName is `'all'`, it will also add `default` to the id on default
exports.

## License

MIT © [akameco](http://akameco.github.io)
