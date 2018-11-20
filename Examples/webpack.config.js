const path = require('path');
const makeCesiumWebpack = require('@znemz/cesium-webpack-config').default;
// const util = require('util');

const config = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sources.bundle.js'
  },
  plugins: [],
  module: {
    rules: [
      // {
      //   test: /.*cesium.*/,
      //   use: 'imports-loader?document=>window'
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // {
      //   test: /\.js$/,
      //   loader: 'string-replace-loader',
      //   options: {
      //     search: /(.*document.*)/,
      //     replace: 'if (typeof window !== undefined) { $1 }'
      //   }
      // },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
};

module.exports = makeCesiumWebpack(config, path.join(__dirname, '../'));
// console.warn(util.inspect(module.exports, { depth: 50 }));
