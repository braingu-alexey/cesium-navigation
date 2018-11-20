const path = require('path');
const makeCesiumWebpack = require('@znemz/cesium-webpack-config').default;

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
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      /*
        !! TODO: add to cesium-webpack-config
        Make relative asset resolution work relative to Examples/dist
      */
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: "buildModuleUrl\\('(.*)'\\)",
              replace: "buildModuleUrl('Examples/dist/$1')",
              flags: 'g'
            },
            {
              search: "getWorkerUrl\\('(.*)'\\)",
              replace: "getWorkerUrl('Examples/dist/$1')",
              flags: 'g'
            }
          ]
        }
      },
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

module.exports = makeCesiumWebpack(config, {
  rootPath: path.join(__dirname, '../')
});
