import { isFunction, isStringArray, isArray } from '../../helpers/util'

function getTargets(list, selector) {
  let targets = []

  for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i]

    if (item.selector.viewport && selector.viewport) {
      targets = item.data
      break
    } else if (
      item.selector.cid === selector.cid &&
      item.selector.selector === selector.selector
    ) {
      targets = item.data
      break
    }
  }

  if (!isArray(targets)) {
    targets = [targets]
  }
  return targets
}

/**
 * 返回一个 SelectorQuery 对象实例
 * @summary 安全性要求，使用多层闭包禁止暴露私有变量，如'Element'等
 * @param root
 */
export function createSelectorQuery() {
  let _cid = 1
  let _selectorQuery
  let _execQueue = []
  let _reqQueue = []

  class SelectorQuery {
    constructor() {
      return this
    }

    /**
     * api那边设置组件in传入
     * @param component
     */
    in(component) {
      // 加入组件的方法
      if (component) {
        _cid = component._cid
      }
      return this
    }

    /**
     * 在当前页面下选择第一个匹配选择器 selector 的节点
     */
    select(selector) {
      return createNodesRef({ cid: _cid, selector })
    }

    /**
     * 在当前页面下选择匹配选择器 selector 的所有节点。
     */
    selectAll(selector) {
      return createNodesRef({ cid: _cid, selector, all: true })
    }

    /**
     * 选择显示区域
     */
    selectViewport() {
      return createNodesRef({ cid: _cid, viewport: true })
    }

    _exec(callback, data) {
      const res = _execQueue.map(function(handler) {
        return handler.fn(getTargets(data, handler.selector))
      })

      if (isFunction(callback)) {
        callback(res)
      }
    }

    _getApiParams() {
      return _reqQueue
    }
  }

  function createNodesRef(selector) {
    class NodesRef {
      constructor() {
        return this
      }

      boundingClientRect(callback) {
        const handler = {
          selector,
          fn: function(targets) {
            const list = targets.map(function(v) {
              return {
                id: v.id,
                dataset: v.dataset,
                left: v.left,
                right: v.right,
                top: v.top,
                bottom: v.bottom,
                width: v.width,
                height: v.height
              }
            })

            const result = selector.all ? list : list[0]

            if (isFunction(callback)) {
              callback(result)
            }

            return result
          }
        }
        _execQueue.push(handler)
        _reqQueue.push({
          selector,
          fields: {
            size: true,
            rect: true
          }
        })

        // 又返回query实例，方便执行exec
        return _selectorQuery
      }

      scrollOffset(callback) {
        const handler = {
          selector,
          fn: function(targets) {
            const list = targets.map(function(v) {
              return {
                id: v.id,
                dataset: v.dataset,
                scrollLeft: v.scrollLeft,
                scrollTop: v.scrollTop
              }
            })

            const result = selector.all ? list : list[0]

            if (isFunction(callback)) {
              callback(result)
            }

            return result
          }
        }

        _execQueue.push(handler)
        _reqQueue.push({
          selector,
          fields: {
            scrollOffset: true
          }
        })

        // 又返回query实例，方便执行exec
        return _selectorQuery
      }

      fields(fields, callback) {
        const handler = {
          selector,
          fn: function(targets) {
            const list = targets.map(function(v) {
              const item = {}

              if (fields.id === true) {
                item.id = v.id
              }

              if (fields.dataset === true) {
                item.dataset = v.dataset
              }

              if (fields.scrollOffset === true) {
                item.scrollLeft = v.scrollLeft
                item.scrollTop = v.scrollTop
              }

              if (fields.size === true || fields.rect === true) {
                if (fields.size === true) {
                  item.width = v.width
                  item.height = v.height
                }

                if (fields.rect === true) {
                  item.left = v.left
                  item.right = v.right
                  item.top = v.top
                  item.bottom = v.bottom
                }
              }

              // 指定属性名列表，返回节点对应属性名的当前属性值（只能获得组件文档中标注的常规属性值，id class style 和事件绑定的属性值不可获取）
              if (isStringArray(fields.properties)) {
                fields.properties.forEach(function(propName) {
                  item[propName] = v[propName]
                })
              }

              // 指定样式名列表，返回节点对应样式名的当前值
              if (
                isStringArray(fields.computedStyle) &&
                fields.computedStyle.length > 0
              ) {
                fields.computedStyle.forEach(function(styleName) {
                  item[styleName] = v[styleName]
                })
              }

              return item
            })

            const res = selector.all ? list : list[0]

            if (isFunction(callback)) {
              callback(res)
            }

            return res
          }
        }

        _execQueue.push(handler)
        _reqQueue.push({
          selector,
          fields
        })

        // 又返回query实例，方便执行exec
        return _selectorQuery
      }
    }

    return new NodesRef()
  }

  return (_selectorQuery = new SelectorQuery())
}
