module.exports = {
  entry: './demo.js',
  output: {
    path: './',
    filename: 'demo.bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  }
};

