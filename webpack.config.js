const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const dist_path = path.resolve(__dirname, 'dist');

let config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: dist_path,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Snowflake Inspector by Hashmap',
      hash: true,
      filename: 'bundle.html',
      path: dist_path,
      template: './src/html/index.html',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: './src/data/sample-data.csv' }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(ttf|eot|woff||woff2|otf|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['file-loader'],
      },
      {
        test: /\.sql$/,
        use: ['raw-loader'],
      },
    ],
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
    config.devServer = {
      contentBase: './dist',
      hot: true,
      port: 9000,
      openPage: 'bundle.html',
    };
  }

  if (argv.mode === 'production') {
    config.devtool = 'source-map';
  }

  return config;
};
