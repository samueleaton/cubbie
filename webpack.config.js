const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist/',
    filename: 'cubbie.bundle.js',
    library: 'cubbie',
    libraryTarget: 'umd'
  },
  target: 'node',
  node: {
    process: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  }
};

