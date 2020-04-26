const path = require("path");
const webpack = require("webpack");
const HTMLwebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");

const isDev = process.env.NODE_ENV === "development"; // проверка если в режиме разработки
const isProd = !isDev;

const cssLoader = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev, //изменять сущности без перезагрузки страницы
        reloadAll: true,
        publicPath: "../",
      },
    },
    {
      loader: "css-loader",
      options: {
        url: true,
      },
    },
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, "src"), // путь с какой папки и убирается он ниже с путей
  mode: "development",
  entry: {
    index: "./index.js",
    // main: ['@babel/polyfill', './index.js'], // если нужна поддержка старых браузеров
  },
  output: {
    filename: isDev ? `[name].js` : `js/[name].[contenthash:8].chunk.js`,
    path: path.resolve(__dirname, "build"),
  },
  devServer: {
    // // сохраняет в кеш
    // // overlay: true,
      clientLogLevel: 'silent',
    port: 8080, // life перезагрузка webpack-dev-server когда сохраняешь нужно --open для открытия браузера
    hot: isDev,
  },

  optimization: {
    moduleIds: "hashed",
    splitChunks: {
      chunks: "all", // чтобы  чанки одинаковые не вставлялись каждый раз в компонент
      name: false,
    },
    minimizer: [].concat(
      isProd
        ? [
            new OptimizeCssAssetPlugin(), // оптимизация для прода css
            new TerserWebpackPlugin(),
          ]
        : []
    ),
  },
  resolve: {
    extensions: [".js", ".json"], // чтобы не дописывать окончания когда import и какие
    // alias: {
    //   '@model': path.resolve(__dirname,'src') // указывать более короткие пути когда import
    // }
  },
  plugins: [
    new HTMLwebpackPlugin({
      // создание html в build c генерированными скриптами
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd, // оптимизация html build
      },
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CleanWebpackPlugin(), // чистка build перед сборкой
    new CopyWebpackPlugin([
      // перенос файлов тут иконка
      {
        from: path.resolve(__dirname, "src/favicon.ico"),
        to: path.resolve(__dirname, "build"),
      },
    ]),
    new MiniCssExtractPlugin({
      // закидывать в build css
      filename: isDev ? `[name].css` : "css/[name].[hash:8].css",
    }),
    new ErrorOverlayPlugin(),
  ],
  //     .concat(
  //     isProd ? new BundleAnalyzerPlugin() : []
  // )
  devtool: isDev ? "cheap-module-source-map" : "", // map для sass
  module: {
    rules: [
      {
        test: /\.css$/, //регулярка
        use: cssLoader(),
        // use: ['style-loader','css-loader'] //style-loader добавление css в html
        // если совподение с регул то выполн use
      },

      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: "file-loader",
        options: {
          outputPath: "img",
        },
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ["file-loader"],
      },
      //
      // {
      //   test: /\.less$/,
      //   use: cssLoader("less-loader"),
      // },
      {
        test: /\.s[ac]ss$/,
        use: cssLoader("sass-loader"),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-typescript"],
          plugins: ["@babel/plugin-proposal-class-properties"],
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["@babel/plugin-proposal-class-properties"],
            },
          },
          "eslint-loader",
        ],
      },
    ],
  },
};
