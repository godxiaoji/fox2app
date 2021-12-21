import {
  isString,
  isNumber,
  isObject,
  isFunction,
  isBoolean,
  isUndefined
} from './util'
import Exception from './exception'

/**
 * 合并数据
 * @param {Object} parent 引用对象
 * @param {String} key 子健
 * @param {Object|Number|Array|String|Boolean} value 值
 */
export function mergeData(parent, key, value, vm) {
  if (isString(key)) {
    key = getPathLike(key)
    if (key.indexOf('.') !== -1) {
      let [a, ...b] = key.split('.')
      mergeData(parent[a], b.join('.'), value, vm)
      return
    }
  }

  if (
    isString(value) ||
    isNumber(value) ||
    isBoolean(value) ||
    value === null
  ) {
    if (isObject(parent) && isUndefined(parent[key])) {
      vm.$set(parent, key, value)
    } else {
      parent[key] = value
    }
  } else {
    throw new Exception(
      'data only supports 4 basic types (string/number/Boolean/null) and 2 structure types (object/array), and any value should not be undefined',
      Exception.TYPE.PARAM_ERROR,
      'setData'
    )
  }
}

export function getInitData(data) {
  let ret

  if (isFunction(data)) {
    ret = data()
  } else if (isObject(data)) {
    ret = data
  }

  return isObject(ret) ? ret : {}
}

export function getFirstKey(key) {
  return key.split('.')[0]
}

/**
 * // 处理a[0].b -> a.0.b
 * @param {String} path 路径
 */
export function getPathLike(path) {
  return path.replace(/\[/g, '.').replace(/]/g, '')
}

export function splicePathLike(pathLike, start, deleteCount) {
  let arr = pathLike.split('.')

  arr.splice(start, deleteCount)

  return arr.join('.')
}

/**
 * 根据路径获取相应的值
 * @param {Object} ctx 上下文this
 * @param {String} pathLike 路径
 */
export function getPathLikeValue(ctx, pathLike) {
  if (pathLike === '') {
    return ctx
  } else if (pathLike.indexOf('.') !== -1) {
    let [a, ...b] = pathLike.split('.')

    if (ctx[a]) {
      return getPathLikeValue(ctx[a], b.join('.'))
    }
  } else if (ctx[pathLike]) {
    return ctx[pathLike]
  }

  return
}
