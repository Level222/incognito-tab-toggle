const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
  mode: isProduction ? "production" : "development",
  entry: {
    background: "./src/background/index.ts",
    offscreen: "./src/offscreen/index.ts",
    "window-management-permission-popup":
      "./src/window-management-permission-popup/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader"
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/manifest.json"
        },
        {
          from: "./src/icons",
          to: "icons"
        }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: "offscreen.html",
      chunks: ["offscreen"],
      title: "Incognito Tab Toggle Offscreen Document"
    }),
    new HtmlWebpackPlugin({
      filename: "window-management-permission-popup.html",
      chunks: ["window-management-permission-popup"],
      template: "./src/window-management-permission-popup/index.html"
    }),
    new MiniCssExtractPlugin()
  ],
  resolve: {
    extensions: [".ts", "..."]
  },
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()]
  },
  ...(isProduction ? {} : { devtool: "inline-cheap-module-source-map" })
};
