const webpack = require("webpack");
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'development',
    devtool: "eval-source-map",
    entry: {
        index: [
            "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
            "./src/index.js"
        ]
    },
    output: {
        path: path.resolve(__dirname, "./public"),
        filename: "[name].bundle.js",
        publicPath: "/",
        hotUpdateChunkFilename: ".hot/[id].[hash].hot-update.js",
        hotUpdateMainFilename: ".hot/[hash].hot-update.json"
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html"
        })
    ],
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                "presets": ["@babel/preset-env", "@babel/preset-react"]
              }
            }
          },
          {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader'],
            include: [path.join(__dirname, 'src'),/node_modules/]
          },
          { 
            test: /\.svg$/, 
            loader: 'raw-loader' 
          },
          {
            test: /\.html$/,
            use: [
              {
                loader: "html-loader"
              }
            ]
          }
        ]
      }
};