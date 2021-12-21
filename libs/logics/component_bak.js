import { isFunction, isObject, noop, inArray } from '../helpers/util'
import { mergeData, getInitData, getFirstKey } from '../helpers/data-handler'
import { SET_DATA } from '../helpers/consts'
import { createSelectorQuery, createIntersectionObserver } from './apis'
import { postMessageToPage } from '../helpers/message-handler'

/**
 * 生命周期映射关系表
 */
const lifetimeMappings = {
  created: 'created',
  onLoad: 'created',
  mounted: 'mounted',
  onReady: 'mounted',
  onUnload: 'beforeDestroy',
  beforeDestroy: 'beforeDestroy'
}

/**
 * 逻辑层-组件类
 */
class Component {
  constructor(options, { cid, pid, route, initData }) {
    this.cid = cid
    this.pid = pid
    this._route = route
    this.data = initData // 含props

    const data = getInitData(options.data)
    const _dataKeys = []
    for (const k in data) {
      _dataKeys.push(k.toString())
    }
    this._dataKeys = _dataKeys

    // 处理方法事件
    if (isObject(options.methods)) {
      for (const k in options.methods) {
        if (isFunction(options.methods[k])) {
          this[k] = options.methods[k]
        }
      }
    }

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

    if (cid === 1) {
      // page组件
      this.onShow = isFunction(options.onShow) ? options.onShow : noop
      this.onHide = isFunction(options.onHide) ? options.onHide : noop
    } else {
      // 子组件
      this.onShow = noop
      this.onHide = noop

      if (isObject(options.pageLifetimes)) {
        if (isFunction(options.pageLifetimes.show)) {
          this.onShow = options.pageLifetimes.show
        }
        if (isFunction(options.pageLifetimes.hide)) {
          this.onHide = options.pageLifetimes.hide
        }
      }
    }
  }

  setData(data) {
    const newData = {}
    for (const k in data) {
      if (inArray(getFirstKey(k), this._dataKeys)) {
        try {
          mergeData(this.data, k, data[k])
          newData[k] = data[k]
        } catch (e) {
          console.error(e.message)
        }
      }
    }

    if (!this._destroyed) {
      postMessageToPage(
        {
          cmd: SET_DATA,
          data: newData
        },
        this.cid,
        this.pid
      )
    }
  }

  createSelectorQuery() {
    return createSelectorQuery(this.pid).in(this)
  }

  createIntersectionObserver(options) {
    return createIntersectionObserver(this.pid, this, options)
  }
}

export default Component
