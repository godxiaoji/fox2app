import { isNumberArray, inArray } from '../../helpers/util'

export function createIntersectionObserver(root, options) {
  let _cid = 1
  let _thresholds = [0]
  // let _initialRatio = 0 // 暂时未理解该字段含义
  let _observeAll = false
  let _rootMargins = {}
  let _relativeViewport = true
  let _relativeSelector = null

  if (isNumberArray(options.thresholds)) {
    _thresholds = options.thresholds
  }

  if (options.observeAll === true) {
    _observeAll = true
  }

  if (root && root._cid) {
    _cid = root._cid
  }

  // if (isNumber(options.initialRatio)) {
  //   _initialRatio = Math.max(0, Math.min(1, options.initialRatio))
  // }

  class AppIntersectionObserver {
    constructor() {
      return this
    }

    /**
     * 使用选择器指定一个节点，作为参照区域之一
     * @param selector
     */
    relativeTo(selector, margins) {
      const ignores = ['html', 'head', 'body']

      if (!inArray(selector.toLowerCase(), ignores)) {
        _relativeViewport = false
        _relativeSelector = selector
        _rootMargins = margins
      }

      return this
    }

    /**
     * 指定页面显示区域作为参照区域之一
     */
    relativeToViewport(margins) {
      _relativeViewport = true
      _relativeSelector = null
      _rootMargins = margins

      return this
    }

    _getApiParams(targetSelector) {
      return {
        cid: _cid,
        relativeViewport: _relativeViewport,
        relativeSelector: _relativeSelector,
        margins: _rootMargins,
        observeAll: _observeAll,
        thresholds: _thresholds,
        targetSelector
      }
    }
  }

  return new AppIntersectionObserver()
}
