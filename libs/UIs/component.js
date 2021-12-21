import {
  UI_TYPE_PAGE,
  UI_TYPE_COMPONENT,
  COMPONENT_CREATED,
  COMPONENT_MOUNTED,
  COMPONENT_UPDATED,
  COMPONENT_BEFORE_DESTROY,
  COMPONENT_EVENT,
  COMPONENT_WATCH_DATA_CHANGE,
  COMPONENT_DESTROYED,
  TYPE_UI
} from '../helpers/consts'
import {
  isNumber,
  // isFunction,
  // isObject,
  objectForEach,
  isArray,
  isElement
} from '../helpers/util'
import { postMessageToLogic, postMessage } from '../helpers/message-handler'
import {
  AppMouseEvent,
  AppKeyboardEvent,
  AppUIEvent,
  AppWheelEvent,
  AppEvent,
  AppTouchEvent,
  AppFocusEvent,
  AppInputEvent
} from '../helpers/app-events'
import { AppTarget } from '../helpers/events'
import { getLogic } from './util'

function getInitData(pagePath, compType) {
  const initData = getLogic().getInitData(pagePath, compType)

  return initData
}

function getFilter(pagePath, compType, name) {
  const initData = getLogic().getFilter(pagePath, compType, name)

  return initData
}

function getRefs($refs) {
  const refs = {}

  objectForEach($refs, (v, k) => {
    refs[k] = isArray(v)
      ? v.map(({ _uid }) => {
          return _uid
        })
      : (v && v._uid) || undefined
  })

  return refs
}

/**
 * 组件构造
 * @param {Object} options 初始化项
 * @param {Object} extend { route, components, type } 附加数据
 * @param {Function} onCreated 创建回调函数
 */
export function createComponentOptions(
  options,
  { route, components, type },
  onCreated
) {
  const compType = type === UI_TYPE_PAGE ? UI_TYPE_PAGE : UI_TYPE_COMPONENT

  const propKeys = []
  const data = getInitData(route, compType)

  const pid = parseInt(frameElement.dataset.pid)

  let updateTimer

  const ret = {
    data() {
      return data
    },
    computed: {},
    methods: {},
    watch: {},
    filters: {},
    beforeCreate() {
      this._pid = pid
    },
    created() {
      const cid = this._uid
      onCreated({
        cid,
        vueThis: this
      })

      const initData = {}
      propKeys.forEach(v => {
        initData[v] = this[v]
      })

      const queryString = location.search.substr(1)
      const query = {}
      if (queryString) {
        queryString.split('&').forEach(v => {
          query[v.split('=')[0]] = v.split('=')[1]
        })
      }

      const postData = {
        compType,
        route,
        query,
        pcid: (this.$parent && this.$parent._uid) || null,
        id: (this.$el && this.$el.id) || '',
        cmd: COMPONENT_CREATED,
        initData
      }

      postMessageToLogic(postData, cid, pid)
    },
    mounted() {
      const refs = getRefs(this.$refs)

      // console.log(this.$refs, refs)
      postMessageToLogic(
        {
          cmd: COMPONENT_MOUNTED,
          refs
        },
        this._uid,
        pid
      )
    },
    updated() {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        const refs = getRefs(this.$refs)

        postMessageToLogic(
          {
            cmd: COMPONENT_UPDATED,
            refs
          },
          this._uid,
          pid
        )
      })
    },
    beforeDestroy() {
      postMessageToLogic(
        {
          cmd: COMPONENT_BEFORE_DESTROY
        },
        this._uid,
        pid
      )
    },
    destroyed() {
      // 通知逻辑层组件效果
      postMessageToLogic(
        {
          cmd: COMPONENT_DESTROYED
        },
        this._uid,
        pid
      )

      // 通知master层去掉iframe
      if (this._uid === 1) {
        postMessage(
          {
            cmd: COMPONENT_DESTROYED,
            pid
          },
          TYPE_UI
        )
      }
    }
  }

  // 改为由逻辑层传递data
  // 处理计算属性
  // function handleComputed(name, fn) {
  //   if (isFunction(fn)) {
  //     ret.computed[name] = fn
  //     // handleWatch(name)
  //   } else if (isObject(fn) && isFunction(fn.get)) {
  //     // setter的问题由logic来处理
  //     ret.computed[name] = fn.get
  //   }
  // }

  // if (isObject(options.computed)) {
  //   for (const k in options.computed) {
  //     handleComputed(k, options.computed[k])
  //   }
  // }

  // 处理方法
  function handleMethod(name) {
    ret.methods[name] = function() {
      const args = []

      for (let i = 0; i < arguments.length; i++) {
        const argv = arguments[i]
        // console.log(argv)
        if (argv instanceof WheelEvent) {
          args.push(new AppWheelEvent(argv))
        } else if (argv instanceof MouseEvent) {
          args.push(new AppMouseEvent(argv))
        } else if (argv instanceof KeyboardEvent) {
          args.push(new AppKeyboardEvent(argv))
        } else if (argv instanceof TouchEvent) {
          args.push(new AppTouchEvent(argv))
        } else if (argv instanceof FocusEvent) {
          args.push(new AppFocusEvent(argv))
        } else if (argv instanceof InputEvent) {
          args.push(new AppInputEvent(argv))
        } else if (argv instanceof UIEvent) {
          args.push(new AppUIEvent(argv))
        } else if (argv instanceof Event) {
          args.push(new AppEvent(argv))
        } else if (isElement(argv)) {
          args.push(new AppTarget(argv))
        } else {
          args.push(argv)
        }
      }

      postMessageToLogic(
        {
          cmd: COMPONENT_EVENT,
          methodName: name,
          args
        },
        this._uid,
        pid
      )
    }
  }

  const methods = options.methods || {}
  for (const k in methods) {
    handleMethod(k)
  }

  ret.components = components || {}

  function handleWatch(name) {
    // 深度监听
    ret.watch[name] = {
      handler(value) {
        postMessageToLogic(
          {
            cmd: COMPONENT_WATCH_DATA_CHANGE,
            pathLike: name,
            value
          },
          this._uid,
          pid
        )
      },
      deep: true
    }
  }

  if (compType !== UI_TYPE_PAGE) {
    ret.props = options.props || {}

    // 处理watch
    for (const k in ret.props) {
      const propName = isNumber(k) ? ret.props[k] : k
      handleWatch(propName)

      if (propKeys.indexOf(propName) === -1) {
        propKeys.push(propName)
      }
    }
  }

  objectForEach(options.filters, (fn, k) => {
    ret.filters[k] = function(...args) {
      return getFilter(route, compType, k).apply(this, args)
    }
  })

  return ret
}
