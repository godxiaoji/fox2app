import {
  isFunction,
  isObject,
  isArray,
  cloneData,
  objectForEach,
  noop,
  inArray,
  isUndefined,
  isNumeric,
  isString
} from '../helpers/util.js'

import Exception from '../helpers/exception.js'
import { postMessageToPage } from '../helpers/message-handler.js'
import { SET_DATA } from '../helpers/consts.js'
import { createSelectorQuery, createIntersectionObserver } from './apis'
import {
  getPathLike,
  getFirstKey,
  getPathLikeValue,
  splicePathLike,
  mergeData
} from '../helpers/data-handler.js'

function isPureObject(object) {
  if (!isObject(object)) {
    return false
  } else {
    for (const propName in object) {
      if (isObject(object[propName])) {
        return false
      }
    }
  }
  return true
}

/**
 * 生命周期映射关系表
 */
const lifetimeMappings = {
  created: 'created',
  onLoad: 'created',
  mounted: 'mounted',
  onReady: 'mounted',
  updated: 'updated',
  onUnload: 'beforeDestroy',
  beforeDestroy: 'beforeDestroy',
  destroyed: 'destroyed',

  onShow: 'onShow',
  onHide: 'onHide'
}

const forbidSetKeys = [
  '_cid',
  '_pid',
  '_route',
  '_id',
  '$parent',
  '$children',
  '$page',
  '$refs',
  '_destroyed'
]

export function createComponent(
  options,
  { cid, pid, route, initData, $parent, id }
) {
  class Fx {
    constructor() {
      const data = options.data()

      objectForEach(data, (v, k) => {
        this[k] = v

        watches[k] = {
          _isData: true,
          handlers: [],
          setDataFn
        }
      })

      if (!isPureObject(this)) {
        addSubProxy(this, '')
      }

      // 处理props
      objectForEach(initData, (v, k) => {
        this[k] = v

        watches[k] = {
          _isProp: true,
          handlers: [],
          setDataFn: null
        }
      })

      // 处理方法事件
      objectForEach(options.methods, (fn, k) => {
        if (!isFunction(fn)) {
          throw new Exception(`methods.${k}必须是一个函数`)
        } else if (watches[k]) {
          throw new Exception(`methods.${k}不能跟data已有的值同名`)
        } else {
          this[k] = fn
        }
      })

      // 处理生命周期
      for (const k in lifetimeMappings) {
        // 先设置默认的生命周期
        this[lifetimeMappings[k]] = noop
      }

      for (const k in lifetimeMappings) {
        if (isFunction(options[k])) {
          this[lifetimeMappings[k]] = options[k]
        }
      }

      this.$children = []
      this.$refs = []

      if ($parent) {
        this.$parent = $parent
      }

      this._fx = true
      this._id = id
      this._cid = cid
      this._pid = pid
      this._route = route
    }

    $watch(
      expOrFn,
      callback,
      options = {
        immediate: false
      }
    ) {
      const id = watchUid++
      let oldVal

      if (!isObject(options)) {
        options = {}
      }
      const deep = !!options.deep
      const immediate = !!options.immediate

      if (isFunction(expOrFn)) {
        watchFn = function() {
          let newVal = expOrFn.call(proxy)
          callback.call(this, newVal, oldVal)
          oldVal = newVal
        }
        watchFn._watched = true
        watchFn._id = id

        let newVal = expOrFn.call(proxy)
        if (immediate) {
          watchFn.call(proxy, newVal, oldVal)
        }
        oldVal = newVal
      } else {
        const pathLike = getPathLike(expOrFn)
        const firstKey = getFirstKey(pathLike)

        if (watches[firstKey]) {
          watchFn = function(newVal, oldVal, propPath, receiver) {
            const watchPathLike = this._pathLike

            if (!watchPathLike) {
              callback.call(receiver, newVal, oldVal)
            } else if (
              (deep && propPath.startsWith(watchPathLike)) ||
              (!deep && propPath === watchPathLike)
            ) {
              const valuePathLike = splicePathLike(watchPathLike, 0, 1)

              callback.call(
                receiver,
                getPathLikeValue(newVal, valuePathLike),
                getPathLikeValue(oldVal, valuePathLike)
              )
            }
          }
          watchFn._watched = true
          watchFn._id = id
          watchFn._pathLike = pathLike

          watches[firstKey].handlers.push(watchFn)

          let newVal = getPathLikeValue(this, pathLike)
          newVal = newVal ? cloneData(newVal) : undefined
          if (immediate) {
            callback.call(proxy, newVal, oldVal)
          }
          oldVal = newVal
        } else {
          console.error(
            new Exception(
              `No data can be found by the pathLike "${expOrFn}"`,
              Exception.TYPE.WATCH_FAIL
            )
          )
        }
      }

      watchFn = null

      // 返回一个取消
      return function() {
        for (const watchObj in watches) {
          for (let i = 0, len = watchObj.handlers.length; i < len; i++) {
            const handler = watchObj.handlers[i]
            if (handler._watched && handler._id === id) {
              watchObj.handlers.splice(i, 1)
            }
          }
        }
      }
    }

    $createSelectorQuery() {
      return createSelectorQuery(this._pid).in(this)
    }

    $createIntersectionObserver(options) {
      return createIntersectionObserver(this._pid, this, options)
    }
  }

  const watches = {}
  let watchFn = null
  let watchUid = 1

  function setDataFn(newData) {
    if (!fx._destroyed) {
      console.log(cid, 'setDataFn', newData)

      if (!forbidNotifyOther) {
        postMessageToPage(
          {
            cmd: SET_DATA,
            data: newData
          },
          cid,
          pid
        )
      }
    }
  }

  const fx = new Fx()

  // computed
  const computedProxy = new Proxy(fx, {
    get(target, key) {
      if (watchFn) {
        watches[key].handlers.push(watchFn)
      }

      // console.log(`${key} 被读取`)
      return target[key]
    }
  })

  // 解决相互set导致的死循环问题
  const forbidRepeatSettings = {}
  let forbidComputeSetter = false

  const handler = {
    set(target, key, value, receiver) {
      if (watches[key]) {
        return dataHandler(target, key, value, receiver, null)
      } else if (lifetimeMappings[key]) {
        // 生命周期
        if (isFunction(value)) {
          target[key] = value.bind(receiver)
          return value
        } else {
          throw new Exception('生命周期必须是函数')
        }
      } else if (inArray(key, forbidSetKeys)) {
        throw new Exception(`"${forbidSetKeys}"为保留字段，不允许设置`)
      } else {
        target[key] = value
        return value
      }
    }
  }

  const proxy = new Proxy(fx, handler)

  objectForEach(options.computed, (getSetOrFn, key) => {
    let _setDataFn = null
    const handlers = []
    let fn = getSetOrFn

    // 处理设置的问题
    if (isObject(getSetOrFn) && isFunction(getSetOrFn.get)) {
      if (isFunction(getSetOrFn.set)) {
        _setDataFn = setDataFn

        const setFn = function(newVal, oldVal, propPath, receiver) {
          if (!forbidComputeSetter) {
            getSetOrFn.set.call(receiver, newVal, oldVal)
          }
        }

        setFn._isComputeSetter = true

        handlers.push(setFn)
      }

      fn = getSetOrFn.get
    }

    if (isFunction(fn)) {
      watches[key] = {
        _isComputed: true,
        handlers,
        setDataFn: _setDataFn
      }

      // 处理依赖和初始化
      watchFn = function(newVal, oldVal, propPath, receiver) {
        if (!forbidRepeatSettings[this._propName]) {
          // 计算属性回调
          forbidComputeSetter = true
          receiver[key] = fn.call(receiver, receiver)
          forbidComputeSetter = false
        }
      }
      watchFn._isComputed = true
      watchFn._propName = key

      // 调用watch函数获取初始值
      fx[key] = fn.call(computedProxy)

      watchFn = null
    }
  })

  // 处理初始watch
  objectForEach(options.watch, (expOrFn, pathLike) => {
    const expOrFns = isArray(expOrFn) ? expOrFn : [expOrFn]

    expOrFns.forEach(expOrFn => {
      let callback
      const options = {}

      if (expOrFn && isFunction(expOrFn.handler)) {
        callback = expOrFn.handler
        options.immediate = expOrFn.immediate
        options.deep = expOrFn.deep
      } else if (isString(expOrFn)) {
        // 表达式
        callback = new Function(expOrFn)
      } else if (isFunction(expOrFn)) {
        callback = expOrFn
      }

      if (callback) {
        fx.$watch(pathLike, callback, options)
      }
    })
  })

  let arrayHandler = {}

  function finishArrayHandler() {
    if (arrayHandler.target) {
      clearTimeout(arrayHandler.timer)
      dataHandler(
        arrayHandler.target,
        'length',
        arrayHandler.target.length,
        arrayHandler.receiver,
        arrayHandler.propDir
      )
      arrayHandler = {}
    }
  }

  /**
   * 设置data
   * @param {Object} target 源对象
   * @param {String} key key
   * @param {any} value 被设置的值
   * @param {Proxy} receiver 代理器
   * @param {String} propDir 路径
   */
  function dataHandler(target, key, value, receiver, propDir) {
    const propPath = propDir ? [propDir, key].join('.') : key

    if (isUndefined(value)) {
      throw new Exception(`"${propPath}"不能设置为"undefined"`)
    } else if (JSON.stringify(value) === JSON.stringify(target[key])) {
      // 值一样
      return true
    }

    const isArrayTarget = isArray(target)
    let setDatas = {
      [propPath]: value
    }

    // console.log(target, key, value)
    // 合并数组操作
    if (
      arrayHandler.target &&
      (!isArrayTarget || (isArrayTarget && arrayHandler.target !== target))
    ) {
      finishArrayHandler()
    }
    if (isArrayTarget) {
      if (key === 'length') {
        if (arrayHandler.target) {
          clearTimeout(arrayHandler.timer)
          setDatas = arrayHandler.data
          setDatas[propPath] = value
          arrayHandler = {}
        }
      } else if (isNumeric(key)) {
        target[key] = isObject(value)
          ? addSubProxy(cloneData(value), propPath)
          : value

        if (!arrayHandler.target) {
          arrayHandler = {
            target,
            receiver,
            propDir,
            data: { [propPath]: value }
          }

          arrayHandler.timer = setTimeout(() => {
            finishArrayHandler()
          })
        } else {
          arrayHandler.data[propPath] = value
        }

        return true
      }
    }

    const rootKey = getFirstKey(propPath)
    const { handlers, setDataFn, _isComputed } = watches[rootKey]

    // 缓存旧的数据
    const oldVal = isObject(fx[rootKey]) ? cloneData(fx[rootKey]) : fx[rootKey]

    target[key] = isObject(value)
      ? addSubProxy(cloneData(value), propPath)
      : value

    // computed setter 可能修改到会引起 当前 computed 依赖的数据，依赖的数据又会引起 computed 的变化，需要再后面变化时忽略到后面的变化
    if (_isComputed) {
      forbidRepeatSettings[rootKey] = true
    }

    setDataFn && setDataFn(setDatas)

    // 缓存新的数据
    const newVal = isObject(fx[rootKey]) ? cloneData(fx[rootKey]) : fx[rootKey]

    handlers.forEach(fn => {
      fn.call(fn, newVal, oldVal, propPath, receiver)
    })

    if (_isComputed) {
      delete forbidRepeatSettings[rootKey]
    }

    return true
  }

  function getSubHandler(propDir) {
    const handler = {
      set(target, key, value) {
        return dataHandler(target, key, value, proxy, propDir)
      }
    }

    return handler
  }

  /**
   * 递归代理
   * @param {Object} object 被代理对象
   * @param {String} propDir a.b.c..d
   */
  function addSubProxy(object, propDir) {
    for (let prop in object) {
      if (isObject(object[prop])) {
        const propPath = propDir ? [propDir, prop].join('.') : prop

        if (!isPureObject(object[prop])) {
          addSubProxy(object[prop], propPath)
        }
        object[prop] = new Proxy(object[prop], getSubHandler(propPath))
      }
    }

    object = new Proxy(object, getSubHandler(propDir))

    return object
  }

  let forbidNotifyOther = false // 是否禁止通知ui层，主要是防止其他层过来的通知又通知回去，目前有效隔离了，暂未用到

  /**
   * 检测改变值
   * @param {String} key propName
   * @param {any} value 值
   */
  function watchChange(key, value) {
    forbidNotifyOther = true
    mergeData(proxy, key, value)
    forbidNotifyOther = false
  }

  /**
   * 添加组件
   * @param {Proxy} childProxy
   */
  function addChild(childProxy) {
    fx.$children.push(childProxy)
  }

  function removeChild(childProxy) {
    for (let i = 0; i < fx.$children.length; i++) {
      if (fx.$children[i]._cid === childProxy._cid) {
        fx.$children.splice(i, 1)
        break
      }
    }
  }

  // console.log(proxy, watches)

  return {
    _cid: cid,
    _route: route,
    proxy,
    watchChange,
    addChild,
    removeChild,
    source: fx
  }
}
