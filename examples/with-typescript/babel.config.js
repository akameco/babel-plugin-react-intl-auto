module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    plugins: [
      [
        'react-intl-auto',
        {
          removePrefix: 'app/',
        },
      ],
    ],
  }
}
