import './index.css'

import apis from './masters/apis'
import { appConfig } from './app-config'
import { setStyles } from './helpers/style-handler'
import {
  API_CALL,
  API_CALLBACK,
  COMPONENT_DESTROYED,
  APP_SHOW,
  APP_HIDE,
  TYPE_LOGIC,
  APP_LAUNCH
} from './helpers/consts'
import {
  masterPostMessageToLogic,
  masterPostMessageToPage
} from './helpers/message-handler'
import {
  reLaunch,
  getDefaultPage,
  removeFrame,
  getCurrentPages
} from './masters/router'
import { SDKKey } from './config'

const origin = location.origin
console.log(appConfig)

document.addEventListener('DOMContentLoaded', function() {
  __$._masterLoaded = true

  setStyles(document.body, {
    width: appConfig.size.windowWidth,
    height: appConfig.size.windowHeight
  })

  if (__$._logicLoaded) {
    __$.load()
  }
})

window.addEventListener('message', function(e) {
  if (e.origin !== origin) {
    return
  }

  const res = e.data
  const { sourceType } = res

  switch (res.cmd) {
    case COMPONENT_DESTROYED: {
      // 初始化
      removeFrame(res.pid)
      break
    }
    case API_CALL: {
      // api调用
      if (apis[res.apiName]) {
        // 从哪一层来回哪去
        const handler =
          sourceType === TYPE_LOGIC
            ? masterPostMessageToLogic
            : masterPostMessageToPage

        const { pid, msgId } = res

        apis[res.apiName](
          Object.assign(res.apiParams, {
            success(data) {
              handler(
                {
                  cmd: API_CALLBACK,
                  data,
                  error: null,
                  msgId
                },
                1,
                pid
              )
            },
            fail(error) {
              handler(
                {
                  cmd: API_CALLBACK,
                  error,
                  data: null,
                  msgId
                },
                1,
                pid
              )
            }
          })
        )
      }
      break
    }
    default: {
      break
    }
  }
})

window[SDKKey] = apis
window.getCurrentPages = getCurrentPages

function getCurrentPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

function $get(selector) {
  return document.querySelector(selector)
}

function bindEvents() {
  // 绑定导航事件
  $get('#navBack').addEventListener(
    'click',
    function() {
      apis.navigateBack()
    },
    false
  )

  $get('#navHome').addEventListener(
    'click',
    function() {
      apis.reLaunch({ url: getDefaultPage() })
    },
    false
  )
}

bindEvents()

let _appLoaded = false

window.__$ = window.__$ || {}
window.__$.load = function() {
  if (_appLoaded) {
    return
  }
  _appLoaded = true

  const queryString = location.search.substr(1)
  const query = {}
  if (queryString) {
    queryString.split('&').forEach(v => {
      query[v.split('=')[0]] = v.split('=')[1]
    })
  }

  let url = getDefaultPage()
  if (query.__page) {
    url = query.__page
    delete query.__page
  }
  const [path] = url.split('?')

  masterPostMessageToLogic({
    cmd: APP_LAUNCH,
    options: {
      query,
      path
    }
  })

  reLaunch({ url })
}
window.__$.show = function() {
  const page = getCurrentPage()

  masterPostMessageToLogic(
    {
      cmd: APP_SHOW
    },
    1,
    page.pid
  )
}
window.__$.hide = function() {
  const page = getCurrentPage()

  masterPostMessageToLogic(
    {
      cmd: APP_HIDE
    },
    1,
    page.pid
  )
}
