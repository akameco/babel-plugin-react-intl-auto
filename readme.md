# babel-plugin-react-intl-auto [![Build Status](https://travis-ci.org/akameco/babel-plugin-react-intl-auto.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-react-intl-auto)

> Auto generate react-intl id

## Install

```
$ yarn add --dev babel-plugin-react-intl-auto
```

## Usage

.babelrc

```json
{
  "plugins": [
    ["react-intl-auto", {
      "removePrefix": "app/"
    }]
  ]
}
```

## License

MIT © [akameco](http://akameco.github.io)
