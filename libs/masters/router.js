import { appConfig, getPageConfig } from '../app-config'
import { inArray, isObject } from '../helpers/util'
import Exception from '../helpers/exception'
import {
  masterPostMessageToPage,
  masterPostMessageToLogic
} from '../helpers/message-handler'
import {
  COMPONENT_BEFORE_DESTROY,
  COMPONENT_SHOW,
  COMPONENT_HIDE
} from '../helpers/consts'
import { setStyles, hideElement, showElement } from '../helpers/style-handler'
import { parseParamsByRules } from '../apis/rules'
import { getCallbackFns } from '../apis/callback'

const ROUTE_MAX = 5
let _routes = []
let pid = 0

const allowPages = appConfig.pages
const tabBarPages = appConfig.tabBar.list.map(({ pagePath }) => {
  return pagePath
})
const tabBarCache = {}

const $pageFrames = document.getElementById('pageFrames')
const $navLeft = document.getElementById('navBack').parentNode
const $navCenter = $navLeft.nextElementSibling

/**
 * 创建iframe
 * @param {String} pagePath 页面路径
 * @param {String} search 路径后的参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
 */
function createFrame(pagePath, search, options = {}) {
  const $frame = document.createElement('div')
  $frame.className = 'frame'
  if (options.isTab) {
    $frame.classList.add('tab-frame')
    $frame.dataset.tab = 1
  } else {
    $frame.dataset.tab = 0
  }
  $frame.dataset.pid = ++pid
  $frame.dataset.page = pagePath
  setStyles({
    zIndex: options.zIndex
  })
  $frame.innerHTML = `<iframe id="pageFrame_${$frame.dataset.pid}" data-pid="${
    $frame.dataset.pid
    }" src="/${pagePath}.html${search ? ('?' + search) : ''}" frameborder="0"></iframe>`
  const $iframe = $frame.firstElementChild
  $iframe.addEventListener(
    'load',
    function() {
      options.success({})
      options.complete()
    },
    true
  )
  $iframe.addEventListener(
    'error',
    function(error) {
      options.fail(
        new Exception(error, Exception.TYPE.DEFAULT, options.apiName)
      )
      options.complete()
    },
    true
  )

  return $frame
}

/**
 * 销毁页面
 * @param {HTMLElement} $frame 节点
 */
function destroyPage($frame) {
  if ($frame._destroyed) {
    // 防止重复销毁
    return
  }

  // const $iframe = $frame.querySelector('iframe')
  // $iframe.src = 'about:blank'
  // try {
  //   $iframe.contentWindow.document.write('')
  //   $iframe.contentWindow.document.clear()
  // } catch (e) {}

  masterPostMessageToPage(
    {
      cmd: COMPONENT_BEFORE_DESTROY
    },
    1,
    getFramePid($frame)
  )
  // $frame.parentNode.removeChild($frame)
  hideElement($frame)
  $frame._destroyed = true
}

/**
 * 根据pid获取页面节点
 * @param {Number} pid 页面id
 */
export function getFrame(pid) {
  return document.getElementById('pageFrame_' + pid).parentNode
}

/**
 * 根据pid删除节点
 * @param {Number} pid 页面id
 */
export function removeFrame(pid) {
  const $frame = getFrame(pid)
  $frame.parentNode.removeChild($frame)
}

/**
 * 判断url是否tab中的页面
 * @param {String} url
 * @returns {Boolean}
 */
function isTabPage(url) {
  const [pagePath] = url.split('?')

  return inArray(pagePath, tabBarPages)
}

export function getDefaultPage() {
  return allowPages[0]
}

/**
 * 返回最近的路由
 * @returns {HTMLElement}
 */
function getLastRoute() {
  return _routes[_routes.length - 1]
}

/**
 * 获取节点的页面id
 * @param {HTMLElement} $frame
 */
function getFramePid($frame) {
  return parseInt($frame.dataset.pid)
}

/**
 * 该节点是不是tab页面的节点
 * @param {HTMLElement} $frame
 */
function isTabFrame($frame) {
  return $frame.dataset.tab === '1'
}

/**
 * 设置导航按钮
 */
function setNavigation() {
  if (_routes.length >= 3) {
    $navLeft.classList.add('home')
    $navLeft.classList.add('back')
  } else if (_routes.length >= 2) {
    $navLeft.classList.add('back')
    $navLeft.classList.remove('home')
  } else if (_routes.length === 1) {
    if (isTabFrame(_routes[0])) {
      $navLeft.classList.remove('back')
      $navLeft.classList.remove('home')
    } else {
      $navLeft.classList.remove('back')
      $navLeft.classList.add('home')
    }
  } else {
    $navLeft.classList.remove('back')
    $navLeft.classList.add('home')
  }

  if (_routes.length > 0) {
    const pagePath = getLastRoute().dataset.page
    const pageConfig = getPageConfig(pagePath)

    setStyles($navLeft.parentNode, {
      backgroundColor: pageConfig.navigationBarBackgroundColor
    })

    if (pageConfig.navigationBarTextStyle === 'black') {
      document.body.classList.remove('mode--dark')
    } else {
      document.body.classList.add('mode--dark')
    }

    $navCenter.textContent = pageConfig.navigationBarTitleText
  }
}

/**
 * 创建页面错误
 * @param {String} pagePath 页面路径
 * @param {String} apiName 接口名
 */
function createPageException(pagePath, apiName) {
  return new Exception(
    `page "${pagePath}" is not found`,
    Exception.TYPE.DEFAULT,
    apiName
  )
}

/**
 * 创建页面错误2
 * @param {String} pagePath 页面路径
 * @param {String} apiName 接口名
 * @param {Boolean} inTabBar 是否在里面
 */
function createTabbarException(pagePath, apiName, inTabBar = false) {
  return new Exception(
    `page "${pagePath}" should ${!inTabBar ? 'not ' : ''}be in tabBar`,
    Exception.TYPE.DEFAULT,
    apiName
  )
}

/**
 * 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层。
 * @param {Object} object.url 需要跳转的应用内非 tabBar 的页面的路径 (代码包路径), 路径后可以带参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
 */
export function navigateTo(object) {
  if (!isObject(object)) {
    object = {}
  }

  const { success, fail, complete } = getCallbackFns(object)
  const apiName = object._apiName || 'navigateTo'

  try {
    const { url } = parseParamsByRules(object, apiName)

    if (_routes.length >= ROUTE_MAX) {
      throw new Exception(
        `${apiName} ${ROUTE_MAX} pages at most`,
        Exception.TYPE.DEFAULT,
        apiName
      )
    }

    const [page, search] = url.split('?')

    if (!inArray(page, allowPages)) {
      throw createPageException(page, apiName)
    } else if (inArray(page, tabBarPages)) {
      throw createTabbarException(page, apiName)
    }

    const $last = getLastRoute()
    if ($last) {
      // 如之前存在路由，通知隐藏
      hideElement($last)
      masterPostMessageToLogic({ cmd: COMPONENT_HIDE }, 1, getFramePid($last))
    }

    const $frame = createFrame(page, search, {
      isTab: false,
      zIndex: 100,
      apiName,
      success,
      fail,
      complete
    })
    $pageFrames.appendChild($frame)

    _routes.push($frame)
    setNavigation()
  } catch (error) {
    fail(error)
    complete()
  }
}

/**
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 * @param {Object} object.url 需要跳转的 tabBar 页面的路径 (代码包路径)（需在 app.json 的 tabBar 字段定义的页面），路径后不能带参数
 */
export function switchTab(object) {
  if (!isObject(object)) {
    object = {}
  }

  const { success, fail, complete } = getCallbackFns(object)
  const apiName = object._apiName || 'switchTab'

  try {
    const { url } = parseParamsByRules(object, apiName)
    const [page] = url.split('?')

    if (!inArray(page, allowPages)) {
      throw createPageException(page, apiName)
    } else if (!inArray(page, tabBarPages)) {
      throw createTabbarException(page, apiName, true)
    }

    if (_routes.length === 1) {
      const $prevFrame = _routes[0]

      if (page === $prevFrame.dataset.page) {
        throw new Exception(
          `${apiName} page "${page}" duplicate`,
          Exception.TYPE.DEFAULT,
          apiName
        )
      }

      if (isTabFrame($prevFrame)) {
        // 之前也是一个tab页面，不做销毁，通知隐藏
        masterPostMessageToLogic(
          { cmd: COMPONENT_HIDE },
          1,
          getFramePid($prevFrame)
        )
      }
    }

    // 闭其他所有非 tabBar 页面
    while (_routes.length > 0) {
      const $last = getLastRoute()
      if (isTabFrame($last)) {
        break
      } else {
        const $frame = _routes.pop()
        destroyPage($frame)
      }
    }

    let isExist = false
    let $frame

    for (const k in tabBarCache) {
      if (k === page) {
        isExist = true
        $frame = tabBarCache[k]
        setStyles(tabBarCache[k], {
          display: 'block',
          zIndex: 2
        })
      } else {
        setStyles(tabBarCache[k], {
          display: 'none',
          zIndex: 1
        })
      }
    }

    if (!isExist) {
      // 如果页面本身不存在
      $frame = createFrame(page, '', {
        isTab: true,
        zIndex: 2,
        apiName,
        success,
        fail,
        complete
      })
      if ($pageFrames.firstElementChild) {
        $pageFrames.insertBefore($frame, $pageFrames.firstElementChild)
      } else {
        $pageFrames.appendChild($frame)
      }
      tabBarCache[page] = $frame
    } else {
      // 如果本身页面存在
      masterPostMessageToLogic({ cmd: COMPONENT_SHOW }, 1, getFramePid($frame))
      success({})
      complete()
    }

    _routes = [$frame]
    setNavigation()
  } catch (error) {
    fail(error)
    complete()
  }
}

/**
 * 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
 * @param {Object} object.delta 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
 */
export function navigateBack(object) {
  if (!isObject(object)) {
    object = {}
  }

  const { success, fail, complete } = getCallbackFns(object)
  const apiName = 'navigateBack'

  try {
    const { delta } = parseParamsByRules(object, apiName)

    if (_routes.length <= 1) {
      throw new Exception(
        'operation not allowed',
        Exception.TYPE.DEFAULT,
        apiName
      )
    }

    for (let i = 0; i < delta; i++) {
      if (_routes.length <= 1) {
        break
      }

      const $last = getLastRoute()
      if (isTabFrame($last)) {
        break
      }

      const $frame = _routes.pop()
      destroyPage($frame)

      // 通知之前页面展示
      const $prevFrame = getLastRoute()
      showElement($prevFrame)
      masterPostMessageToLogic(
        { cmd: COMPONENT_SHOW },
        1,
        getFramePid($prevFrame)
      )
      success({})

      setNavigation()
    }
  } catch (error) {
    fail(error)
  }

  complete()
}

/**
 * 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。
 * @param {Object} object.url 需要跳转的应用内非 tabBar 的页面的路径 (代码包路径), 路径后可以带参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
 */
export function redirectTo(object) {
  if (!isObject(object)) {
    object = {}
  }

  const { success, fail, complete } = getCallbackFns(object)
  const apiName = 'redirectTo'

  try {
    const { url } = parseParamsByRules(object, apiName)
    const [page, search] = url.split('?')

    if (!inArray(page, allowPages)) {
      throw createPageException(page, apiName)
    } else if (inArray(page, tabBarPages)) {
      throw createTabbarException(page, apiName)
    }

    const $last = getLastRoute()
    // if (inArray($last.dataset.page, tabBarPages)) {
    //   throw new Exception('"redirectTo"不允许在tabBar的页面中使用')
    // }
    destroyPage($last)

    const $frame = createFrame(page, search, {
      isTab: false,
      zIndex: 100,
      apiName,
      success,
      fail,
      complete
    })
    $pageFrames.appendChild($frame)

    _routes[_routes.length - 1] = $frame
    setNavigation()
  } catch (error) {
    fail(error)
    complete()
  }
}

/**
 * 关闭所有页面，打开到应用内的某个页面。
 * @param {Object} object.url 需要跳转的应用内页面路径 (代码包路径)，路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 'path?key=value&key2=value2'
 */
export function reLaunch(object) {
  if (!isObject(object)) {
    object = {}
  }

  const { fail, complete } = getCallbackFns(object)
  const apiName = 'reLaunch'

  try {
    const { url } = parseParamsByRules(object, apiName)
    const [page] = url.split('?')

    if (!inArray(page, allowPages)) {
      throw createPageException(page, apiName)
    }

    for (const k in tabBarCache) {
      destroyPage(tabBarCache[k])
      delete tabBarCache[k]
    }

    _routes.forEach($frame => {
      destroyPage($frame)
    })
    _routes = []

    if (isTabPage(url)) {
      switchTab(Object.assign(object, { _apiName: apiName }))
    } else {
      navigateTo(Object.assign(object, { _apiName: apiName }))
    }
  } catch (error) {
    fail(error)
    complete()
  }
}

/**
 * 获取当前页面路由
 * @returns {Object[]}
 */
export function getCurrentPages() {
  return _routes.map(v => {
    return {
      pid: getFramePid(v),
      isTab: isTabFrame(v),
      page: v.dataset.page
    }
  })
}

export default {
  navigateTo,
  switchTab,
  navigateBack,
  redirectTo,
  reLaunch
}
