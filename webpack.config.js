const path = require('path');
const webpack = require('webpack');
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
      template: './src/html/index.html'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ]
      },
      {
        test: /\.sql$/,
        use: [
          'raw-loader',
        ]
      },
    ]
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
    config.devServer = {
      contentBase: './dist',
    };
  }

  if (argv.mode === 'production') {
    config.devtool = 'source-map';
  }

  return config;
};