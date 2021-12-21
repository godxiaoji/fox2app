import './page.css'

import { createSelectorQuery } from './apis/SelectorQuery'
import { createIntersectionObserver } from './apis/IntersectionObserver'
import { noop, objectForEach } from './helpers/util'
import { mergeData } from './helpers/data-handler'
import { postMessageToLogic } from './helpers/message-handler'
import {
  COMPONENT_BEFORE_DESTROY,
  UI_TYPE_PAGE,
  SET_DATA,
  API_CALLBACK,
  API_CALL,
  INTERSECTION_OBSERVER_OBSERVE,
  INTERSECTION_OBSERVER_DISCONNECT,
  SELECTOR_QUERY_EXEC
} from './helpers/consts'
import { createComponentOptions } from './UIs/component'
import { getLogic } from './UIs/util'
import './UIs/directive'

const componentMap = {}

/**
 * 组件构造
 * @param {Object} extend { route, components, type } 附加数据
 * @param {Object} options 初始化项
 */
function Component(extend, options) {
  const ret = createComponentOptions(options, extend, function({
    cid,
    vueThis
  }) {
    componentMap[cid] = vueThis
  })

  return ret
}

/**
 * 页面构造
 * @param {Object} extend 附加数据
 * @param {Object} options 初始化项
 */
function Page(extend, options) {
  const ret = createComponentOptions(
    options,
    Object.assign(extend, { type: UI_TYPE_PAGE }),
    function({ cid, vueThis }) {
      componentMap[cid] = vueThis
    }
  )

  return ret
}

/**
 * 执行传过来的调用SelectorQuery
 * @param {Object} param0 { pid, cid, apiParams, msgId }
 */
function selectorQueryExec({ pid, cid, apiParams, msgId }) {
  // 合并数据
  const list = []

  apiParams.forEach(function(v) {
    let isExit = false
    for (const item of list) {
      if (v.selector.viewport && item.selector.viewport) {
        isExit = true
        item.fields = Object.assign(item.fields, v.fields)
      } else if (
        item.selector.cid === v.selector.cid &&
        item.selector.selector === v.selector.selector
      ) {
        isExit = true
        if (v.selector.all) {
          item.selector.all = true
        }
        item.fields = Object.assign(item.fields, v.fields)
      }
    }
    if (!isExit) {
      list.push(v)
    }
  })

  const query = createSelectorQuery()

  list.forEach(function({ selector, fields }) {
    query.in(componentMap[selector.cid])

    let nodesRef
    if (selector.viewport) {
      nodesRef = query.selectViewport()
    } else if (selector.all) {
      nodesRef = query.selectAll(selector.selector)
    } else {
      nodesRef = query.select(selector.selector)
    }

    fields.id = true
    fields.dataset = true
    nodesRef.fields(fields)
  })

  query.exec(function(res) {
    postMessageToLogic(
      {
        cmd: API_CALLBACK,
        error: null,
        data: res.map(function(v, k) {
          return {
            data: v,
            selector: list[k].selector
          }
        }),
        msgId
      },
      cid,
      pid
    )
  })
}

const intersectionObservers = {}

function intersectionObserverObserve({ pid, cid, apiParams, msgId }) {
  const io = createIntersectionObserver(componentMap[apiParams.cid], {
    thresholds: apiParams.thresholds,
    observeAll: apiParams.observeAll
  })

  io._pid = pid
  io._msgId = msgId

  if (apiParams.relativeViewport) {
    io.relativeToViewport(apiParams.margins)
  } else {
    io.relativeTo(apiParams.relativeSelector, apiParams.margins)
  }

  io.observe(apiParams.targetSelector, function(res) {
    postMessageToLogic(
      {
        cmd: API_CALLBACK,
        error: null,
        data: res,
        msgId
      },
      cid,
      pid
    )
  })

  intersectionObservers[msgId] = io
}

function intersectionObserverDisconnect({ msgId }) {
  const io = intersectionObservers[msgId]
  if (io) {
    io.disconnect()
    delete intersectionObservers[msgId]
  }
}

window.addEventListener('message', function(e) {
  // console.log(e)
  const res = e.data
  const component = componentMap[res.cid]

  switch (res.cmd) {
    case SET_DATA: {
      if (component) {
        const data = res.data
        // 初始化
        for (const i in data) {
          mergeData(component, i, data[i], component)
        }
      }
      break
    }
    case COMPONENT_BEFORE_DESTROY: {
      if (component) {
        component.$destroy()
      }
      break
    }
    case API_CALL: {
      switch (res.apiName) {
        case SELECTOR_QUERY_EXEC: {
          selectorQueryExec(res)
          break
        }
        case INTERSECTION_OBSERVER_OBSERVE: {
          intersectionObserverObserve(res)
          break
        }
        case INTERSECTION_OBSERVER_DISCONNECT: {
          intersectionObserverDisconnect(res)
          break
        }
        default: {
          break
        }
      }
      break
    }
    default: {
      break
    }
  }
})

window.Page = Page
window.Component = Component
window.getApp = noop

// 处理通用过滤器
const appFilters = getLogic().getAppFilters()
objectForEach(appFilters, (fn, id) => {
  Vue.filter(id, fn)
})
