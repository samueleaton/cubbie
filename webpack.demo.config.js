const webpack = require('webpack');

module.exports = {
  entry: './demos/demo.js',
  output: {
    path: './demos/',
    filename: 'demo.bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  }
};

