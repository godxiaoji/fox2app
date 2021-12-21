const fse = require('fs-extra')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const AppPlugin = require('fox2app-loader/plugins')

const appData = fse.readJsonSync(path.resolve('./src/app.json'))

const entries = () => {
  const ret = {}

  // 处理页面和组件
  appData.pages.forEach(v => {
    ret[v] = path.resolve(`./src/${v}.fxml`)
  })

  ret['app-service'] = path.resolve(__dirname, `../frame/app-service.js`)
  ret['config-service'] = path.resolve(__dirname, `../frame/config-service.js`)

  return ret
}

const output = {
  path: path.resolve('./dist'),
  filename: '[name].js'
}

const getPlugins = mode => {
  const ret = []

  if (mode === 'production') {
    ret.push(new CleanWebpackPlugin())
  }

  ret.push(
    new AppPlugin({
      mode
    })
  )

  // ui html
  appData.pages.forEach(v => {
    ret.push(
      new HtmlWebpackPlugin({
        filename: v + '.html', //打包后的文件名
        minify: {
          //对html文件进行压缩
          removeAttributeQuotes: true, //去掉属性的双引号
          removeComments: true, //去掉注释
          collapseWhitespace: true //去掉空白
        },
        chunks: [v], //每个html只引入对应的js和css
        inject: true,
        hash: false, //避免缓存js。
        template: path.resolve(__dirname, '../frame/page.html') //打包html模版的路径和文件名称
      })
    )
  })

  // master html
  ret.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['config-service'],
      inject: 'head',
      hash: false, //避免缓存js。
      template: path.resolve(__dirname, '../frame/index.html') //打包html模版的路径和文件名称
    })
  )

  // logic html
  ret.push(
    new HtmlWebpackPlugin({
      filename: 'logic.html',
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['app-service'],
      inject: true,
      hash: false, //避免缓存js。
      template: path.resolve(__dirname, '../frame/logic.html') //打包html模版的路径和文件名称
    })
  )

  ret.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('./src/app.json'),
          to: path.join(output.path, './app.json')
        },
        {
          from: path.resolve('./project.config.json'),
          to: path.join(output.path, 'project.config.json')
        },
        {
          from: path.join(__dirname, '../frame/libs/'),
          to: path.join(output.path, './libs')
          // ignore: ["*.html"],
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

  return ret
}

module.exports = function getConfig(mode = 'production') {
  return {
    mode,
    devtool: mode === 'development' ? 'inline-source-map' : false,
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    },
    module: {
      rules: [
        {
          test: /\.fxml$/,
          exclude: /node_modules/,
          use: ['fox2app-loader']
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: true,
                hmr: process.env.NODE_ENV === 'development'
              }
            },
            'css-loader'
          ]
        }
      ]
    },
    entry: entries(),
    output,
    plugins: getPlugins(mode)
  }
}
