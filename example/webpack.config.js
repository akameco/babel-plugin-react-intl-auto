'use strict'
const path = require('path')

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, './app'),
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/assets',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './app'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
}
