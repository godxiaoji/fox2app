const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const libList = ['index', 'logic', 'component', 'page']

const entries = () => {
  const ret = {}

  libList.forEach(v => {
    const name = 'libs/' + v
    ret[name] = path.resolve(`./${name}.js`)
  })

  return ret
}

const output = {
  path: path.resolve(__dirname, '../frame'),
  filename: '[name].js',
  publicPath: '/'
}

const getPlugins = () => {
  const ret = [new CleanWebpackPlugin()]

  ret.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['libs/index'],
      inject: 'body',
      hash: false, //避免缓存js。
      template: path.resolve(__dirname, '../libs/template/index.html') //打包html模版的路径和文件名称
    })
  )

  ret.push(
    new HtmlWebpackPlugin({
      filename: 'logic.html',
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['libs/logic'],
      inject: 'head',
      hash: false, //避免缓存js。
      template: path.resolve(__dirname, '../libs/template/logic.html') //打包html模版的路径和文件名称
    })
  )

  ret.push(
    new HtmlWebpackPlugin({
      filename: 'page.html',
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['libs/component', 'libs/page'],
      inject: 'head',
      hash: false, //避免缓存js。
      template: path.resolve(__dirname, '../libs/template/page.html') //打包html模版的路径和文件名称
    })
  )

  ret.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../libs/static/'),
          to: path.join(output.path, './libs/static')
          // ignore: ["*.html"],
        },
        {
          from: path.join(__dirname, '../libs/app-service.js'),
          to: path.join(output.path, './app-service.js')
        },
        {
          from: path.join(__dirname, '../libs/config-service.js'),
          to: path.join(output.path, './config-service.js')
        }
      ],
      options: {}
    })
  )

  ret.push(
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  )

  ret.push(
    new OptimizeCSSAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            normalizeUnicode: false
          }
        ]
      },
      canPrint: false
    })
  )

  ret.push(new VueLoaderPlugin())

  return ret
}

module.exports = {
  mode: 'development',
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: ['vue-loader']
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  entry: entries(),
  output,
  plugins: getPlugins()
}
