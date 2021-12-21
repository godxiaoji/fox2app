const fse = require('fs-extra')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const AppPlugin = require('../modules/fox2app-loader/plugins')

const appData = fse.readJsonSync(path.resolve('./src/app.json'))

const libList = ['index', 'logic', 'component', 'page']

const entries = () => {
  const ret = {}

  // 处理页面和组件
  appData.pages.forEach(v => {
    ret[v] = path.resolve(`./src/${v}.fxml`)
  })

  libList.forEach(v => {
    const name = 'libs/' + v
    ret[name] = path.resolve(`./${name}.js`)
  })

  ret['app-service'] = path.resolve(`./frame/app-service.js`)
  ret['config-service'] = path.resolve(`./frame/config-service.js`)

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
        template: path.resolve('./frame/page.html') //打包html模版的路径和文件名称
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
      template: path.resolve('./frame/index.html') //打包html模版的路径和文件名称
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
      template: path.resolve('./frame/logic.html') //打包html模版的路径和文件名称
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
          from: path.join('./libs/static/'),
          to: path.join(output.path, './libs/static')
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

  ret.push(new VueLoaderPlugin())

  return ret
}

module.exports = function getConfig(mode = 'production') {
  return {
    resolveLoader: {
      // 去哪些目录下寻找 Loader，有先后顺序之分
      modules: ['node_modules', './modules/']
    },
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
    plugins: getPlugins(mode)
  }
}
