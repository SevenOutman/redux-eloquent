const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    path.join(__dirname, 'src/index'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'redux-eloquent.min.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader?babelrc'
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false // eslint-disable-line
      },
    }),
    new webpack.BannerPlugin({ banner: `Last update: ${new Date().toString()}` }),
  ],
};
