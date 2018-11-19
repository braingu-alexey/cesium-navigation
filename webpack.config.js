const path = require('path');
// const debug = require('./debug').spawn('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack.min.js' // for webpack 3 /4 w UnminifiedWebpackPlugin
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
};
