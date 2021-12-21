import {
  isFunction,
  noop,
  inArray,
  objectForEach,
  cloneData,
  isObject,
  isArray
} from './helpers/util'
import { createComponent } from './logics/component'
import {
  COMPONENT_WATCH_DATA_CHANGE,
  COMPONENT_CREATED,
  COMPONENT_MOUNTED,
  COMPONENT_EVENT,
  UI_TYPE_PAGE,
  COMPONENT_BEFORE_DESTROY,
  COMPONENT_SHOW,
  COMPONENT_HIDE,
  APP_SHOW,
  APP_HIDE,
  APP_LAUNCH,
  API_CALLBACK,
  COMPONENT_UPDATED,
  COMPONENT_DESTROYED
} from './helpers/consts'
import { msgCallbackFns, getApis } from './logics/apis'
import { getCurrentPages } from './logics/router'
import { SDKKey } from './config'

const componentMap = {}

/**
 * 初始化组件
 * @param {Object} res
 */
function initComponent(res) {
  const componentOptions = getComponentOptions(res.route, res.compType)

  const { pid, cid, pcid } = res

  const parentComponent = pcid ? getComponent(pid, pcid) : null

  const component = (componentMap[`${pid},${cid}`] = createComponent(
    componentOptions,
    {
      route: res.route,
      cid,
      pid,
      pcid,
      id: res.id,
      $parent: (parentComponent && parentComponent.proxy) || null,
      initData: res.initData
    }
  ))

  if (cid !== 1) {
    const rootComponent = getComponent(pid, 1)
    component.source.$root = (rootComponent && rootComponent.proxy) || null
  }

  if (parentComponent) {
    parentComponent.addChild(component.proxy)
  }

  // console.log(c.proxy)
  component.proxy.created(res.query)
}

/**
 * 获取缓存组件
 * @param {Number} pid
 * @param {Number} cid
 */
function getComponent(pid, cid) {
  return componentMap[`${pid},${cid}`] || null
}

function updateRefs({ pid, refs, cid }) {
  const currentComponent = getComponent(pid, cid)

  if (currentComponent) {
    const $newRefs = {}

    objectForEach(refs, (cids, k) => {
      if (isArray(cids)) {
        $newRefs[k] = []
        cids.forEach(cid => {
          const subComponent = getComponent(pid, cid)

          if (subComponent) {
            $newRefs[k].push(subComponent.proxy)
          }
        })
      } else {
        $newRefs[k] = undefined

        if (cids) {
          const subComponent = getComponent(pid, cids)

          if (subComponent) {
            $newRefs[k] = subComponent.proxy
          }
        }
      }
    })

    currentComponent.source.$refs = $newRefs
  }
}

/**
 * 初始化app
 */
const lifetimeKeys = ['onLaunch', 'onShow', 'onHide']
let appOnLaunch = noop
let appOnShow = noop
let appOnHide = noop
const app = {}
function initApp(appOptions) {
  for (const k in appOptions) {
    if (!inArray(k, lifetimeKeys)) {
      app[k] = appOptions[k]
    }
  }

  // 处理生命周期
  if (isFunction(appOptions.onLaunch)) {
    appOnLaunch = appOptions.onLaunch.bind(app)
  }
  if (isFunction(appOptions.onShow)) {
    appOnShow = appOptions.onShow.bind(app)
  }
  if (isFunction(appOptions.onHide)) {
    appOnHide = appOptions.onHide.bind(app)
  }

  // 处理全局过滤器
  app.filters = {}
  objectForEach(appOptions.filters, (fn, k) => {
    if (isFunction(fn)) {
      app.filters[k] = fn.bind(undefined)
    }
  })
}

/**
 * 调用页面所有组件生命周期函数
 * @param {Number} pid
 * @param {String} lifetimeKey 生命周期key，如onShow等
 */
function callPageComponentLifetimes(pid, lifetimeKey) {
  for (const k in componentMap) {
    if (k.startsWith(`${pid},`)) {
      // 所有该页面组件
      componentMap[k].proxy[lifetimeKey]()
    }
  }
}

/**
 * 获取初始化数据
 * @param {String} pagePath 页面路径
 * @param {'page'|'component'} compType 组件类型 page component
 */
function getInitData(pagePath, compType) {
  const componentOptions = getComponentOptions(pagePath, compType)

  let ret

  if (isFunction(componentOptions.data)) {
    ret = componentOptions.data()
  }

  ret = cloneData(isObject(ret) ? ret : {})

  // 处理computed 数据
  if (isObject(componentOptions.computed)) {
    objectForEach(componentOptions.computed, (v, k) => {
      if (isFunction(v)) {
        ret[k] = v.call(ret)
      } else if (v && isFunction(v.get)) {
        ret[k] = v.get.call(ret)
      }
    })
  }

  return ret
}

/**
 * 获取过滤器
 * @param {String} pagePath 页面路径
 * @param {'page'|'component'} compType 组件类型 page component
 * @param {String} name 过滤器函数名
 */
function getFilter(pagePath, compType, name) {
  const componentOptions = getComponentOptions(pagePath, compType)

  if (isObject(componentOptions.filters)) {
    if (isFunction(componentOptions.filters[name])) {
      return componentOptions.filters[name]
    }
  }

  return function(value) {
    return value
  }
}

function getAppFilters() {
  return app.filters
}

/**
 * 获取组件配置
 * @param {String} pagePath 页面路径
 * @param {'page'|'component'} compType 组件类型 page component
 */
function getComponentOptions(pagePath, compType) {
  let fileName
  let componentOptions

  if (compType === UI_TYPE_PAGE) {
    fileName = `.${pagePath.replace('pages', '')}.js`
    componentOptions = _pageCtx(fileName).default
  } else {
    fileName = `.${pagePath.replace('components', '')}.js`
    componentOptions = _compCtx(fileName).default
  }

  return componentOptions
}

let _pageCtx, _compCtx

function serviceLoad({ pageCtx, compCtx, appOptions }) {
  _pageCtx = pageCtx
  _compCtx = compCtx
  initApp(appOptions)
  window.top.__$.logicOnLoad()
}

window.addEventListener('message', function(e) {
  const res = e.data
  const { pid, cid } = res
  const key = `${pid},${cid}`
  const component = componentMap[key] || null

  switch (res.cmd) {
    case API_CALLBACK: {
      // api回调
      const apiCallbackFns = msgCallbackFns[res.msgId]

      if (apiCallbackFns) {
        if (res.error) {
          apiCallbackFns.fail(res.error)
        } else {
          apiCallbackFns.success(res.data)
        }
        apiCallbackFns.complete()

        if (!apiCallbackFns.infinite) {
          delete msgCallbackFns[res.msgId]
        }
      }
      break
    }

    case COMPONENT_CREATED: {
      // 初始化
      initComponent(res)
      break
    }
    case COMPONENT_MOUNTED: {
      // vue mounted
      if (component) {
        updateRefs(res)

        component.proxy.mounted()
        component.proxy.onShow()
      }
      break
    }
    case COMPONENT_UPDATED: {
      // vue mounted
      if (component) {
        updateRefs(res)

        component.proxy.updated()
      }
      break
    }
    case COMPONENT_SHOW: {
      // comp show
      if (component) {
        callPageComponentLifetimes(pid, 'onShow')
      }
      break
    }
    case COMPONENT_HIDE: {
      // comp hide
      if (component) {
        callPageComponentLifetimes(pid, 'onHide')
      }
      break
    }
    case COMPONENT_BEFORE_DESTROY: {
      // vue beforeDestroy
      if (component) {
        component.source._destroyed = true
        component.proxy.beforeDestroy()
      }
      break
    }
    case COMPONENT_DESTROYED: {
      // vue destroyed
      if (component) {
        const proxy = component.proxy
        proxy.destroyed()

        if (proxy.$parent) {
          // 从父组件删掉自己
          const parentComponent =
            componentMap[`${proxy.$parent._pid},${proxy.$parent._cid}`]

          if (parentComponent) {
            parentComponent.removeChild(proxy)
          }
        }

        // 删掉自己
        delete componentMap[key]
      }

      if (cid === 1) {
        // 在page中，销毁通知消息（漏操作的，循环的）
        setTimeout(function() {
          objectForEach(msgCallbackFns, function(v, k) {
            if (v.pid === pid) {
              delete msgCallbackFns[k]
            }
          })
        }, 2000)
      }
      break
    }
    case COMPONENT_EVENT: {
      // 事件处理
      if (component) {
        const proxy = component.proxy
        if (isFunction(proxy[res.methodName])) {
          proxy[res.methodName].apply(proxy, res.args)
        }
      }
      break
    }
    case COMPONENT_WATCH_DATA_CHANGE: {
      // prop
      if (component) {
        component.watchChange(res.pathLike, res.value)
      }
      break
    }
    case APP_SHOW: {
      appOnShow()
      // comp show
      if (component) {
        callPageComponentLifetimes(pid, 'onShow')
      }
      break
    }
    case APP_HIDE: {
      appOnHide()
      // comp hide
      if (component) {
        callPageComponentLifetimes(pid, 'onHide')
      }
      break
    }
    case APP_LAUNCH: {
      appOnLaunch(res.options)
      appOnShow()
      break
    }
    default: {
      break
    }
  }
})

window[SDKKey] = getApis()
window.__$ = {
  serviceLoad,
  getInitData,
  getFilter,
  getAppFilters
}

window.getCurrentPages = getCurrentPages
window.getApp = function getApp() {
  return app
}
