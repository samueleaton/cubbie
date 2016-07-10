const webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: './dist/',
    filename: 'cubbie.min.js',
    library: 'cubbie',
    libraryTarget: 'umd',
    sourceMapFilename: 'cubbie.min.map'
  },
  target: 'node',
  node: {
    process: false
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false }
    })
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  }
};

