const fse = require('fs-extra')
const path = require('path')
const { isObject } = require('util')

function kebabCase2CamelCase(name) {
  name = name.replace(/-(\w)/g, (all, letter) => {
    return letter.toUpperCase()
  })
  return name.substr(0, 1).toLowerCase() + name.substr(1)
}

/**
 * 小程序架构解析插件
 * @author Travis
 */

class AppPlugin {
  constructor(options) {
    // 根据 options 配置你的插件
    this.sourcePath = path.resolve(options.src)
    this.pages = options.pages
    this.tempPath = options.tempPath
    this.mode = options.mode
  }

  apply(compiler) {
    // compiler.hooks.compile.tap('AppPlugin', (params) => {
    // })

    // console.log(compiler.inputFileSystem.readFileSync)

    compiler.hooks.run.tapPromise('AppPlugin', compiler => {
      return this.createTempFiles(compiler).then(res => {
        console.log('Add Cache Done.')
        return res
      })
    })

    compiler.hooks.watchRun.tapPromise('AppPlugin', compiler => {
      console.log(compiler.watchFileSystem.watcher.mtimes)

      return this.createTempFiles(compiler).then(res => {
        console.log('Add Watch Cache Done.')
        return res
      })
    })

    // compiler.hooks.make.tapAsync('AppPlugin', (compiler, callback) => {
    //   console.log('make')

    //   callback()
    // })

    compiler.hooks.emit.tapAsync('AppPlugin', (compilation, callback) => {
      // const manifest = {}
      for (const name of Object.keys(compilation.assets)) {
        // manifest[name] = compilation.assets[name].size()
        // 将生成文件的文件名和大小写入manifest对象

        if (this.mode === 'production') {
          if (name === 'app-service.js') {
            const newOutput = `(function(window,document,history,localStorage,location,parent,frames,frameElement){${compilation.assets[
              name
            ].source()}})()`
            compilation.assets[name] = {
              source() {
                return newOutput
              },
              size() {
                return this.source().length
              }
            }
          }
        }
      }
      // compilation.assets['manifest.json'] = {
      //   source() {
      //     return JSON.stringify(manifest)
      //   },
      //   size() {
      //     return this.source().length
      //   }
      // }
      callback()
    })

    compiler.hooks.afterEmit.tapPromise('AppPlugin', () => {
      if (this.mode === 'production') {
        // 删除临时文件
        return fse.remove(this.tempPath)
      } else {
        return Promise.resolve()
      }

      // if (this.mode === 'production') {
      //   return this.deleteFolderRecursive(compiler, this.tempPath)
      // } else {
      //   return Promise.resolve()
      // }
    })

    compiler.hooks.afterCompile.tapAsync(
      'AppPlugin',
      (compilation, callback) => {
        console.log('afterCompile')

        // this.cssRequirePaths.forEach(filePath => {
        //   compilation.fileDependencies.push(filePath)
        // })

        callback()
      }
    )
  }

  createTempFiles(compiler) {
    const fs = compiler.outputFileSystem
    const tempPath = this.tempPath
    // 创建临时处理目录
    // fse.ensureDirSync(tempPath)
    // fs.mkdirp(tempPath)
    // console.log('A  ' + tempPath)

    const asyncWriteList = []

    function writeCache(filePath, ext, content) {
      asyncWriteList.push(
        new Promise((resolve, reject) => {
          const dirs = filePath.split('/')
          fs.mkdirp(
            path.resolve(tempPath, ...dirs.slice(0, dirs.length - 1)),
            function(err) {
              if (err) {
                reject(err)
              } else {
                const fullFilePath = path.resolve(
                  tempPath,
                  `${filePath}.${ext}`
                )

                fs.writeFile(fullFilePath, content, function(err, data) {
                  if (err) {
                    reject(err)
                  } else {
                    console.log('A  ' + fullFilePath)
                    resolve(data)
                  }
                })
              }
            }
          )
        })
      )
    }

    // 服务层
    writeCache(
      'app-service',
      'js',
      `const appOptions = require('@/app.js');
    const pageCtx = require.context('@/pages', true, /\\.js$/);
    const compCtx = require.context('@/components', true, /\\.js$/);
    __$.serviceLoad({ pageCtx, compCtx, appOptions });`
    )

    writeCache(
      'config-service',
      'js',
      `const pageCtx = require.context('@/pages', true, /\\.json$/)
    import appJson from '@/app.json'

    export function getPageCtx() {
      return pageCtx
    }

    export function getAppJson() {
      return appJson
    }

    window.__$ = window.__$ || {}
    window.__$.getPageCtx = getPageCtx
    window.__$.getAppJson = getAppJson`
    )

    const pageRequireComponents = []

    const cssRequirePaths = []

    // 解析页面组件
    for (const pagePath of this.pages) {
      let [htmlCont, cssCont, jsCont, jsonCont] = [
        'html',
        'css',
        'js',
        'json'
      ].map(ext => {
        const filePath = path.resolve(this.sourcePath, `${pagePath}.${ext}`)

        if (ext === 'css') {
          cssRequirePaths.push(filePath)
        }

        return this.loadFileContent(filePath, ext)
      })

      // 解析json
      const compRequirePaths = []
      const compNames = []
      if (isObject(jsonCont.usingComponents)) {
        for (const k in jsonCont.usingComponents) {
          const compName = kebabCase2CamelCase(k)
          const compPath = jsonCont.usingComponents[k].replace(/^\//, '')

          compRequirePaths.push(
            `import ${compName} from '${this.getRelativePath(
              pagePath,
              compPath
            )}.vue';`
          )
          compNames.push(compName)

          if (pageRequireComponents.indexOf(compPath) === -1) {
            pageRequireComponents.push(compPath)
          }
        }
      }

      jsCont =
        compRequirePaths.join('') +
        jsCont.replace(
          /^[^]*export\sdefault[\s]+\{/,
          `export default Page({route:'${pagePath}',components:{${compNames.join(
            ','
          )}}},{`
        ) +
        ')'

      const vueTpl = `<template>${htmlCont}</template><script>${jsCont}</script><style scoped>${cssCont}</style>`
      writeCache(pagePath, 'vue', vueTpl)
      const importFileName = pagePath.split('/').pop()
      const jsTpl = `import App from './${importFileName}.vue';new Vue({render: h => h(App)}).$mount('#app');`
      writeCache(pagePath, 'js', jsTpl)
    }

    const allRequireComponents = []
    const addComponentPath = compPath => {
      if (allRequireComponents.indexOf(compPath) === -1) {
        allRequireComponents.push(compPath)
      }

      const jsonCont = this.loadFileContent(
        path.resolve(this.sourcePath, `${compPath}.json`),
        'json'
      )

      if (isObject(jsonCont.usingComponents)) {
        for (const k in jsonCont.usingComponents) {
          addComponentPath(jsonCont.usingComponents[k].replace(/^\//, ''))
        }
      }
    }

    for (const compPath of pageRequireComponents) {
      addComponentPath(compPath)
    }

    // 解析子组件
    for (const compPath of allRequireComponents) {
      let [htmlCont, cssCont, jsCont, jsonCont] = [
        'html',
        'css',
        'js',
        'json'
      ].map(ext => {
        const filePath = path.resolve(this.sourcePath, `${compPath}.${ext}`)

        if (ext === 'css') {
          cssRequirePaths.push(filePath)
        }

        return this.loadFileContent(filePath, ext)
      })

      // 解析json
      const compRequirePaths = []
      const compNames = []
      if (isObject(jsonCont.usingComponents)) {
        for (const k in jsonCont.usingComponents) {
          const subComponentName = kebabCase2CamelCase(k)
          const subComponentPath = jsonCont.usingComponents[k].replace(
            /^\//,
            ''
          )

          compRequirePaths.push(
            `import ${subComponentName} from '${this.getRelativePath(
              compPath,
              subComponentPath
            )}.vue';`
          )
          compNames.push(subComponentName)
        }
      }

      jsCont =
        compRequirePaths.join('') +
        jsCont.replace(
          /^[^]*export default[\s]+\{/,
          `export default Component({route:'${compPath}',components:{${compNames.join(
            ','
          )}}},{`
        ) +
        ')'

      const vueTpl = `<template>${htmlCont}</template><script>${jsCont}</script><style scoped>${cssCont}</style>`
      writeCache(compPath, 'vue', vueTpl)
    }

    this.cssRequirePaths = cssRequirePaths

    return Promise.all(asyncWriteList)
  }

  /**
   * 删除文件夹
   * @param {Compiler} compiler
   * @param {String} url
   */
  deleteFolderRecursive(compiler, url) {
    const { statSync, readdirSync } = compiler.inputFileSystem
    const { unlink, rmdir } = compiler.outputFileSystem

    return Promise.all(
      readdirSync(url).map(file => {
        const curPath = path.join(url, file)
        /**
         * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
         */
        if (statSync(curPath).isDirectory()) {
          // recurse
          return this.deleteFolderRecursive(compiler, curPath)
        } else {
          return new Promise((reslove, reject) => {
            unlink(curPath, function(err) {
              if (err) {
                reject(err)
              } else {
                console.log('D  ' + curPath)
                reslove(curPath)
              }
            })
          })
        }
      })
    ).then(() => {
      return new Promise((reslove, reject) => {
        rmdir(url, function(err) {
          if (err) {
            reject(err)
          } else {
            console.log('D  ' + url)
            reslove(url)
          }
        })
      })
    })
  }

  /**
   * 获取两个path之间的相对地址
   * @param {String} a 当前路径
   * @param {String} b 引入路径
   */
  getRelativePath(a, b) {
    let arr = a.split('/')
    return arr
      .map((v, k) => {
        return k === arr.length - 1 ? b : '..'
      })
      .join('/')
  }

  /**
   * 读取文件内容
   * @param {String} filePath 文件地址
   * @param {String} ext 文件后缀
   */
  loadFileContent(filePath, ext) {
    if (ext === 'json') {
      try {
        return fse.readJsonSync(filePath)
      } catch (e) {
        return {}
      }
    }

    try {
      return fse
        .readFileSync(filePath)
        .toString()
        .trim()
    } catch (error) {
      return ''
    }
  }
}

module.exports = AppPlugin
