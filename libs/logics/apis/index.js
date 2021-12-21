import {
  getMessageId,
  postMessage,
  postMessageToPage
} from '../../helpers/message-handler'
import { getCallbackFns } from '../../apis/callback'
import { isObject } from '../../helpers/util'
import { getCurrentPage } from '../router'
import { createSelectorQuery as _createSelectorQuery } from './SelectorQuery'
import { createIntersectionObserver as _createIntersectionObserver } from './IntersectionObserver'
import { parseParamsByRules, apiRules } from '../../apis/rules'
import {
  API_CALL,
  INTERSECTION_OBSERVER_DISCONNECT,
  INTERSECTION_OBSERVER_OBSERVE,
  SELECTOR_QUERY_EXEC,
  TYPE_LOGIC
} from '../../helpers/consts'
import {
  getStorageInfoSync,
  getStorageInfo,
  getStorageSync,
  getStorage,
  setStorageSync,
  setStorage,
  removeStorageSync,
  removeStorage,
  clearStorageSync,
  clearStorage
} from '../../apis/LocalStorage'
import { canIUse } from '../../caniuse'
import { SDKKey } from '../../config'

let apis = {}
export const msgCallbackFns = {}

/**
 * 初始化api
 * @param {String} name api名
 * @param {Object} rules api规则
 */
function initApi(name) {
  apis[name] = function(options) {
    if (!isObject(options)) {
      options = {}
    }

    const msgId = getMessageId()
    msgCallbackFns[msgId] = getCallbackFns(options)

    try {
      const { pid } = getCurrentPage()
      const params = parseParamsByRules(options, name)
      msgCallbackFns[msgId].pid = pid

      postMessage(
        {
          cmd: API_CALL,
          apiName: name,
          apiParams: params,
          msgId,
          pid
        },
        TYPE_LOGIC
      )
    } catch (error) {
      const apiCallbackFns = msgCallbackFns[msgId]
      apiCallbackFns.fail(error)
      apiCallbackFns.complete()
      delete msgCallbackFns[msgId]
    }
  }
}

export function createSelectorQuery(pid) {
  const query = _createSelectorQuery()
  query.exec = function(callback) {
    const msgId = getMessageId()
    msgCallbackFns[msgId] = Object.assign(
      getCallbackFns({
        success(data) {
          query._exec(callback, data)
        }
      }),
      {
        pid
      }
    )

    postMessageToPage(
      {
        cmd: API_CALL,
        apiName: SELECTOR_QUERY_EXEC,
        apiParams: this._getApiParams(),
        msgId
      },
      1,
      pid,
      TYPE_LOGIC
    )
  }

  return query
}

export function createIntersectionObserver(pid, component, options) {
  let msgId

  const io = _createIntersectionObserver(component, options)

  io.observe = function(targetSelector, callback) {
    msgId = getMessageId()
    msgCallbackFns[msgId] = Object.assign(
      getCallbackFns({
        success(data) {
          callback(data)
        }
      }),
      {
        pid,
        infinite: true
      }
    )

    postMessageToPage(
      {
        cmd: API_CALL,
        apiName: INTERSECTION_OBSERVER_OBSERVE,
        apiParams: this._getApiParams(targetSelector),
        msgId
      },
      1,
      pid,
      TYPE_LOGIC
    )

    return this
  }

  io.disconnect = function() {
    if (msgId) {
      postMessageToPage(
        {
          cmd: API_CALL,
          apiName: INTERSECTION_OBSERVER_DISCONNECT,
          apiParams: {},
          msgId
        },
        1,
        pid,
        TYPE_LOGIC
      )
      delete msgCallbackFns[msgId]
      msgId = null
    }

    return this
  }

  return io
}

function getSystemInfoSync() {
  try {
    return window.top[SDKKey].getSystemInfoSync()
  } catch (error) {
    // console.log(error)
    return {}
  }
}

function getSystemInfo(options) {
  if (!isObject(options)) {
    options = {}
  }
  const apiCallbackFns = getCallbackFns(options)
  try {
    const res = window.top[SDKKey].getSystemInfoSync()

    apiCallbackFns.success(res)
  } catch (error) {
    apiCallbackFns.fail(error)
  }

  apiCallbackFns.complete()
}

function initApis() {
  for (const k in apiRules) {
    initApi(k)
  }

  apis = Object.assign(apis, {
    getStorageInfoSync,
    getStorageInfo,
    getStorageSync,
    getStorage,
    setStorageSync,
    setStorage,
    removeStorageSync,
    removeStorage,
    clearStorageSync,
    clearStorage,

    getSystemInfoSync,
    getSystemInfo,
    canIUse,

    createSelectorQuery() {
      const { pid } = getCurrentPage()

      return createSelectorQuery(pid)
    },
    createIntersectionObserver(component, options) {
      const { pid } = getCurrentPage()

      return createIntersectionObserver(pid, component, options)
    }
  })
}

initApis()

export function getApis() {
  return apis
}
